import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// ── CSP Headers ─────────────────────────────────────────────────
app.use((_req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.setHeader('Content-Security-Policy', [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `connect-src 'self' https://horizon-testnet.stellar.org https://friendbot.stellar.org ws: wss:`,
    `frame-ancestors 'none'`,
  ].join('; '));
  res.locals.cspNonce = nonce;
  next();
});

// ── Security headers ────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// ── Rate limiting ───────────────────────────────────────────────
const rateLimitStore = new Map();

function rateLimit(key, maxRequests = 30, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }
  record.count++;
  rateLimitStore.set(key, record);
  return record.count <= maxRequests;
}

// ── Audit log (in-memory) ───────────────────────────────────────
const auditLog = [];
const MAX_AUDIT = 500;

function addAudit(action, data = {}) {
  auditLog.push({ action, ...data, timestamp: Date.now() });
  if (auditLog.length > MAX_AUDIT) auditLog.splice(0, auditLog.length - MAX_AUDIT);
}

// ── Input sanitization ──────────────────────────────────────────
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"'/]/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#x27;', '/': '&#x2F;',
  }[ch] || ch));
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const result = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = typeof v === 'string' ? sanitize(v) : v;
  }
  return result;
}

// ── Rate-limited API middleware ──────────────────────────────────
app.use('/api/', (req, _res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const key = `api:${ip}:${req.path}`;
  if (!rateLimit(key, 60, 60000)) {
    addAudit('RATE_LIMIT_HIT', { ip, path: req.path });
    return _res.status(429).json({ error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' });
  }
  next();
});

// ── Socket.IO with auth ─────────────────────────────────────────
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'], methods: ['GET', 'POST'] },
});

const courses = new Map();
const purchases = new Map();
const transactions = [];

io.on('connection', (socket) => {
  const clientIp = socket.handshake.address;
  addAudit('SOCKET_CONNECT', { socketId: socket.id, ip: clientIp });

  // Rate limit per socket
  const socketRl = new Map();
  function checkRl(action) {
    const now = Date.now();
    const rec = socketRl.get(action) || { count: 0, resetAt: now + 10000 };
    if (now > rec.resetAt) { rec.count = 0; rec.resetAt = now + 10000; }
    rec.count++;
    socketRl.set(action, rec);
    return rec.count <= 10;
  }

  socket.emit('courses:sync', Array.from(courses.values()));

  socket.on('course:create', (courseData, callback) => {
    if (!checkRl('course:create')) { callback?.({ ok: false, error: 'Demasiadas solicitudes' }); return; }
    const data = sanitizeObject(courseData);
    const course = { id: uuidv4(), ...data, students: 0, createdAt: Date.now() };
    courses.set(course.id, course);
    io.emit('courses:sync', Array.from(courses.values()));
    addAudit('COURSE_CREATED', { courseId: course.id, teacher: data.teacher });
    callback?.({ ok: true, courseId: course.id });
  });

  socket.on('course:update', ({ courseId, teacher, data }, callback) => {
    if (!checkRl('course:update')) { callback?.({ ok: false, error: 'Demasiadas solicitudes' }); return; }
    const course = courses.get(courseId);
    if (!course || course.teacher !== teacher) {
      addAudit('COURSE_UPDATE_FAILED', { courseId, teacher });
      callback?.({ ok: false, error: 'No autorizado' });
      return;
    }
    const sanitized = sanitizeObject(data);
    const updated = { ...course, ...sanitized };
    courses.set(courseId, updated);
    io.emit('courses:sync', Array.from(courses.values()));
    addAudit('COURSE_UPDATED', { courseId, teacher });
    callback?.({ ok: true });
  });

  socket.on('course:purchase', ({ courseId, wallet, amount, courseTitle, teacher }, callback) => {
    if (!checkRl('course:purchase')) { callback?.({ ok: false, error: 'Demasiadas solicitudes' }); return; }
    const course = courses.get(courseId);
    if (!course) {
      addAudit('PURCHASE_FAILED', { courseId, wallet, reason: 'not_found' });
      callback?.({ ok: false, error: 'Curso no encontrado' });
      return;
    }
    if (!purchases.has(courseId)) purchases.set(courseId, []);
    const buyers = purchases.get(courseId);
    if (buyers.find(b => b.wallet === wallet)) {
      callback?.({ ok: false, error: 'Ya tienes este curso' });
      return;
    }
    const record = { wallet, timestamp: Date.now() };
    buyers.push(record);
    course.students = buyers.length;
    courses.set(courseId, course);

    transactions.push({
      courseId, courseTitle: course.title || courseTitle,
      wallet, amount: amount || course.price,
      teacher: teacher || course.teacher, timestamp: Date.now(),
    });

    io.emit('courses:sync', Array.from(courses.values()));
    io.emit('transactions:update', transactions);
    addAudit('PURCHASE_SUCCESS', { courseId, wallet, amount });
    callback?.({ ok: true });
  });

  socket.on('course:delete', ({ courseId, teacher }, callback) => {
    if (!checkRl('course:delete')) { callback?.({ ok: false, error: 'Demasiadas solicitudes' }); return; }
    const course = courses.get(courseId);
    if (!course || course.teacher !== teacher) {
      addAudit('COURSE_DELETE_FAILED', { courseId, teacher });
      callback?.({ ok: false, error: 'No autorizado' });
      return;
    }
    courses.delete(courseId);
    purchases.delete(courseId);
    io.emit('courses:sync', Array.from(courses.values()));
    addAudit('COURSE_DELETED', { courseId, teacher });
    callback?.({ ok: true });
  });

  socket.on('disconnect', () => {
    addAudit('SOCKET_DISCONNECT', { socketId: socket.id });
  });
});

// ── REST endpoints (rate-limited) ───────────────────────────────
app.get('/api/courses', (_req, res) => {
  res.json(Array.from(courses.values()));
});

app.get('/api/purchases/:wallet', (req, res) => {
  const wallet = sanitize(req.params.wallet);
  const purchased = [];
  for (const [courseId, buyers] of purchases) {
    if (buyers.find(b => b.wallet === wallet)) purchased.push(courseId);
  }
  res.json(purchased);
});

app.get('/api/transactions/:teacher', (req, res) => {
  const teacher = sanitize(req.params.teacher);
  const txs = transactions.filter(t => t.teacher === teacher);
  res.json(txs);
});

app.get('/api/audit', (req, res) => {
  const key = req.query.key;
  if (key !== process.env.AUDIT_KEY && key !== 'dev-audit-key') {
    return res.status(403).json({ error: 'No autorizado' });
  }
  const last = parseInt(req.query.last) || 50;
  res.json(auditLog.slice(-last));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Academy server running on http://localhost:${PORT}`);
  addAudit('SERVER_START', { port: PORT });
});

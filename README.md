# Academy - Plataforma Educativa Descentralizada Web3

Sistema educativo descentralizado construido sobre **Stellar blockchain** con **Soroban smart contracts**.

## Arquitectura

```
Academy/
├── contracts/        # Smart contracts Soroban (Rust)
│   ├── users/        # Gestión de usuarios y roles
│   ├── courses/      # Creación y compra de cursos
│   ├── payments/     # Sistema de pagos en blockchain
│   ├── certificates/ # NFTs de certificación académica
│   └── materials/    # Gestión de materiales educativos
├── frontend/         # Aplicación React + TypeScript
│   └── src/
│       ├── components/   # Componentes reutilizables
│       ├── pages/        # Páginas de la aplicación
│       ├── context/      # Context API (Web3, Auth)
│       ├── hooks/        # Custom hooks
│       ├── utils/        # Utilidades y helpers
│       └── types/        # TypeScript types
├── scripts/          # Scripts de despliegue
└── Cargo.toml        # Workspace Rust
```

## Tecnologías

- **Blockchain**: Stellar Testnet, Soroban SDK
- **Backend**: Rust, Soroban Smart Contracts
- **Frontend**: React 18, TypeScript, TailwindCSS
- **Wallet**: Freighter Wallet
- **Almacenamiento**: IPFS (documentos)
- **NFTs**: Certificados y badges en Soroban

## Requisitos

- Rust 1.75+
- Node.js 18+
- Freighter Wallet extension
- Stellar CLI
- Soroban CLI

## Instalación

### 1. Clonar repositorio
```bash
git clone <repo-url>
cd Academy
```

### 2. Compilar contratos
```bash
cd contracts/users && cargo build
cd ../courses && cargo build
cd ../payments && cargo build
cd ../certificates && cargo build
cd ../materials && cargo build
```

### 3. Desplegar contratos (Testnet)
```bash
# Ver scripts/deploy.sh para detalles
./scripts/deploy.sh
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Contratos Inteligentes

### Users Contract
- `register_student()` - Registro de alumno
- `register_teacher()` - Registro de docente
- `validate_user()` - Validación de usuario
- `get_user_profile()` - Perfil de usuario

### Courses Contract
- `create_course()` - Crear curso
- `purchase_course()` - Comprar curso
- `get_course()` - Obtener info del curso
- `update_course()` - Actualizar curso
- `get_courses_by_category()` - Filtrar por categoría

### Payments Contract
- `process_payment()` - Procesar pago
- `get_payment_history()` - Historial de pagos
- `withdraw_funds()` - Retirar fondos
- `refund_payment()` - Reembolso

### Certificates Contract
- `mint_certificate()` - Emitir certificado NFT
- `verify_certificate()` - Verificar certificado
- `get_student_certificates()` - Certificados del alumno
- `get_teacher_issued()` - Certificados emitidos por docente

### Materials Contract
- `upload_material()` - Subir material
- `purchase_material()` - Comprar material
- `access_material()` - Acceder a material
- `get_materials_by_course()` - Materiales de un curso

## Uso con Freighter Wallet

1. Instalar Freighter Wallet extension
2. Cambiar a red Testnet
3. Financiar cuenta con Stellar Testnet Friendbot
4. Conectar con la plataforma

## Licencia

MIT

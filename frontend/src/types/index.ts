export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  registered_at: number;
}

export interface TeacherProfile {
  id: string;
  name: string;
  specialty: string;
  education_level: string;
  email: string;
  wallet: string;
  verified: boolean;
}

export interface Course {
  id: number;
  teacher: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  image_url: string;
  modules: Module[];
  students: string[];
  active: boolean;
  created_at: number;
}

export interface Module {
  title: string;
  content_hash: string;
  duration: number;
  order: number;
}

export interface Material {
  id: number;
  course_id: number;
  teacher: string;
  title: string;
  description: string;
  ipfs_hash: string;
  file_type: string;
  price: number;
  free: boolean;
  created_at: number;
}

export interface Certificate {
  id: string;
  student: string;
  teacher: string;
  course_id: number;
  course_name: string;
  grade: number;
  issued_at: number;
  metadata_uri: string;
  valid: boolean;
}

export interface Payment {
  id: string;
  from: string;
  to: string;
  amount: number;
  course_id: number;
  timestamp: number;
  status: 'Pending' | 'Completed' | 'Refunded';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  courses: number;
}

export interface EducationLevel {
  id: string;
  name: string;
  description: string;
}

export interface AcademicInterest {
  subject: string;
  level: string;
  area: string;
  goal: string;
}

export interface Progress {
  course_id: number;
  completed_modules: number;
  total_modules: number;
  percentage: number;
  time_spent: number;
  last_access: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: number;
}

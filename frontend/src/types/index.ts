export type UserRole = 'student' | 'admin';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseCategory =
  | 'development'
  | 'design'
  | 'business'
  | 'marketing'
  | 'photography'
  | 'music'
  | 'health'
  | 'finance'
  | 'language'
  | 'other';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio: string;
  isVerified: boolean;
  wishlist: Course[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  thumbnail: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: number;
  language: string;
  requirements: string[];
  whatYouLearn: string[];
  tags: string[];
  isPublished: boolean;
  rating: number;
  totalRatings: number;
  totalStudents: number;
  createdBy: Pick<User, '_id' | 'firstName' | 'lastName' | 'avatar' | 'bio'>;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  _id: string;
  course: string;
  title: string;
  description: string;
  order: number;
  lessons?: Lesson[];
  createdAt: string;
}

export interface Resource {
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'code' | 'other';
}

export interface Lesson {
  _id: string;
  module: string;
  title: string;
  videoUrl: string;
  duration: number;
  resources: Resource[];
  order: number;
  isFree: boolean;
  isCompleted?: boolean;
  createdAt: string;
}

export interface Enrollment {
  _id: string;
  student: User | string;
  course: Course | string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  enrollmentDate: string;
  progress: number;
  lastLesson?: Lesson;
  completedLessons: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  user: User | string;
  course: Course | string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
}

export interface Review {
  _id: string;
  user: Pick<User, '_id' | 'firstName' | 'lastName' | 'avatar'>;
  course: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CourseCurriculum extends Module {
  lessons: (Lesson & { isCompleted?: boolean })[];
}

export interface CourseDetailResponse {
  course: Course;
  curriculum: CourseCurriculum[];
  enrollment: Enrollment | null;
  reviews: Review[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

export interface CourseFilters {
  category?: CourseCategory | '';
  level?: CourseLevel | '';
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
  page?: number;
  limit?: number;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RazorpayOrderData {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  course: {
    title: string;
    thumbnail: string;
    price: number;
  };
}

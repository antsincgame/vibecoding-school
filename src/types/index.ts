export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  age_group: string;
  price: string;
  image_url: string;
  features: string[];
  is_active: boolean;
  order_index: number;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  seo_text?: string;
  canonical_url?: string;
  homework_optional?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrialRegistration {
  id?: string;
  age_group: 'child' | 'adult';
  parent_name: string;
  child_name: string | null;
  child_age: number | null;
  phone: string;
  email: string;
  course_id?: string;
  message?: string;
  status?: string;
  created_at?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

export interface EmailSettings {
  id?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  notification_email: string;
  auto_reply_enabled: boolean;
  auto_reply_subject: string;
  auto_reply_body: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StudentWork {
  id: string;
  student_name: string;
  student_age: number;
  project_title: string;
  project_description: string;
  project_url: string;
  image_url: string;
  tool_type: 'bolt' | 'cursor';
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HomePageSettings {
  title: string;
  subtitle: string;
  description: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  duration: string;
  youtube_url: string;
  kinescope_embed: string;
  homework_description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: 'active' | 'completed';
  enrolled_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  course?: Course;
}

export interface LessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  is_completed: boolean;
  is_unlocked: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HomeworkAttachment {
  type: 'image' | 'link';
  url: string;
  name?: string;
}

export interface HomeworkSubmission {
  id: string;
  lesson_id: string;
  student_id: string;
  answer_text: string;
  attachments: HomeworkAttachment[];
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  teacher_id: string | null;
  teacher_feedback: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  lesson?: CourseLesson;
  student?: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

export interface VideoTestimonial {
  id: string;
  student_name: string;
  video_url: string;
  thumbnail_url: string;
  testimonial_text: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

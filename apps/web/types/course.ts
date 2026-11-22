export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';

export interface Category {
  name: string;
  slug: string;
}

export interface Teacher {
  name: string;
  image: string | null;
  position: string;
  bio?: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string | null;
  duration: string | null;
  level: CourseLevel;
  image: string | null;
  isPopular: boolean;
  rating: string | null;
  studentsCount: string | null;
  category: Category;
  teacher: Teacher;
  syllabus?: string;
}

import { Course } from './course';

export interface Teacher {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  position: string;
  bio: string;
}

export interface TeacherDetail extends Teacher {
  courses: Course[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  image: string | null;
  readingTime: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
  } | null;
}

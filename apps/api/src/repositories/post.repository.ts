import { db } from '../config/db.js';
import { posts, adminUsers, type NewPost } from '../config/schema.js';
import { eq, ne, and, desc } from 'drizzle-orm';

interface GetAllPostsOptions {
  excludeSlug?: string;
  limit?: number;
  publishedOnly?: boolean;
}

export const getAllPosts = async (options?: GetAllPostsOptions) => {
  const { excludeSlug, limit, publishedOnly = true } = options || {};
  
  const query = db
    .select({
      post: posts,
      author: {
        id: adminUsers.id,
        name: adminUsers.name,
      },
    })
    .from(posts)
    .leftJoin(adminUsers, eq(posts.authorId, adminUsers.id));

  const filters = [];
  if (publishedOnly) {
    filters.push(eq(posts.isPublished, 'true'));
  }
  if (excludeSlug) {
    filters.push(ne(posts.slug, excludeSlug));
  }

  const finalQuery = filters.length > 0 ? query.where(and(...filters)) : query;

  return await finalQuery
    .orderBy(desc(posts.createdAt))
    .limit(limit || 100);
};

export const getPostBySlug = async (slug: string, options?: { publishedOnly?: boolean }) => {
  const { publishedOnly = true } = options || {};
  const where = publishedOnly
    ? and(eq(posts.slug, slug), eq(posts.isPublished, 'true'))
    : eq(posts.slug, slug);

  const result = await db
    .select({
      post: posts,
      author: {
        id: adminUsers.id,
        name: adminUsers.name,
      },
    })
    .from(posts)
    .leftJoin(adminUsers, eq(posts.authorId, adminUsers.id))
    .where(where)
    .limit(1);

  return result.length > 0 ? result[0] : null;
};
export const createPost = async (data: NewPost) => {
  const result = await db.insert(posts).values(data).returning();
  return result[0];
};

export const updatePost = async (id: string, data: Partial<NewPost>) => {
  const result = await db.update(posts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning();
  return result[0];
};

export const deletePost = async (id: string) => {
  const result = await db.delete(posts).where(eq(posts.id, id)).returning();
  return result[0];
};

export const getPostById = async (id: string) => {
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
};

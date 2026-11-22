import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import * as PostRepository from '../repositories/post.repository.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { PostSchema, type PostInput } from '../schemas/form.schema.js';
import { param } from '../utils/sanitize.js';
import { sanitizeRichText } from '../utils/html.js';

type Locale = 'Az' | 'En' | 'Ru';

/** Only the three supported locales map to columns; anything else falls back to az. */
const localeSuffix = (value: unknown): Locale => {
  const l = String(value ?? 'az').toLowerCase();
  return l === 'en' ? 'En' : l === 'ru' ? 'Ru' : 'Az';
};

/** `?limit=` clamped to 1..100 (a negative or NaN limit used to reach the SQL query). */
const parseLimit = (value: unknown): number | undefined => {
  if (value === undefined) return undefined;
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(Math.max(n, 1), 100);
};

const sanitizeContent = <T extends Partial<PostInput>>(data: T): T => ({
  ...data,
  ...(data.contentAz !== undefined && { contentAz: sanitizeRichText(data.contentAz) }),
  ...(data.contentEn !== undefined && { contentEn: sanitizeRichText(data.contentEn) }),
  ...(data.contentRu !== undefined && { contentRu: sanitizeRichText(data.contentRu) }),
});

// GET /api/blog?locale=az&excludeSlug=...&limit=10
export const listPosts = asyncHandler(async (req: Request, res: Response) => {
  const suffix = localeSuffix(req.query.locale);
  const excludeSlug = typeof req.query.excludeSlug === 'string' ? req.query.excludeSlug : undefined;
  const limit = parseLimit(req.query.limit);

  const postsData = await PostRepository.getAllPosts({ excludeSlug, limit, publishedOnly: true });

  const shaped = postsData.map((item) => {
    const p = item.post;
    const author = item.author;
    return {
      id: p.id,
      slug: p.slug,
      title: p[`title${suffix}`] || p.titleAz,
      excerpt: p[`excerpt${suffix}`] || p.excerptAz,
      image: p.image,
      readingTime: p.readingTime,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      author: author ? { id: author.id, name: author.name } : null,
    };
  });

  return apiResponse.success(res, { data: shaped });
});

// GET /api/blog/:slug?locale=az — published posts only (drafts used to be readable by slug)
export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const slug = param(req, 'slug');
  const suffix = localeSuffix(req.query.locale);

  const data = await PostRepository.getPostBySlug(slug, { publishedOnly: true });
  if (!data) {
    return apiResponse.error(res, { message: 'Məqalə tapılmadı', status: 404 });
  }

  const p = data.post;
  const author = data.author;

  return apiResponse.success(res, {
    data: {
      id: p.id,
      slug: p.slug,
      title: p[`title${suffix}`] || p.titleAz,
      content: p[`content${suffix}`] || p.contentAz,
      excerpt: p[`excerpt${suffix}`] || p.excerptAz,
      image: p.image,
      readingTime: p.readingTime,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      author: author ? { id: author.id, name: author.name } : null,
    },
  });
});

// Admin Controllers
export const listAllPostsAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await PostRepository.getAllPosts({ publishedOnly: false });
  return apiResponse.success(res, { data: posts });
});

export const getPostAdmin = asyncHandler(async (req: Request, res: Response) => {
  const data = await PostRepository.getPostBySlug(param(req, 'slug'), { publishedOnly: false });
  if (!data) return apiResponse.error(res, { message: 'Məqalə tapılmadı', status: 404 });
  return apiResponse.success(res, { data: data.post });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const validated = sanitizeContent(PostSchema.parse(req.body));
  const post = await PostRepository.createPost({
    ...validated,
    authorId: (req as AuthRequest).user?.id,
  });
  return apiResponse.success(res, { data: post, status: 201 });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  // Partial: the dashboard toggles publication with `{ isPublished }` only.
  const validated = sanitizeContent(PostSchema.partial().parse(req.body));
  const post = await PostRepository.updatePost(param(req, 'id'), validated);
  if (!post) return apiResponse.error(res, { message: 'Məqalə tapılmadı', status: 404 });
  return apiResponse.success(res, { data: post });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await PostRepository.deletePost(param(req, 'id'));
  if (!post) return apiResponse.error(res, { message: 'Məqalə tapılmadı', status: 404 });
  return apiResponse.success(res, { message: 'Məqalə silindi' });
});

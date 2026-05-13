import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import * as PostRepository from '../repositories/post.repository.js';

// GET /api/blog?locale=az&excludeSlug=...&limit=10
export const listPosts = asyncHandler(async (req: Request, res: Response) => {
  const locale = (req.query.locale as string) ?? 'az';
  const excludeSlug = req.query.excludeSlug as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

  const postsData = await PostRepository.getAllPosts({ excludeSlug, limit, publishedOnly: true });

  const titleKey = `title${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as 'titleAz' | 'titleEn' | 'titleRu';
  const excerptKey = `excerpt${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as 'excerptAz' | 'excerptEn' | 'excerptRu';

  const shaped = postsData.map((item) => {
    const p = item.post;
    const author = item.author;
    return {
      id: p.id,
      slug: p.slug,
      title: p[titleKey] || p.titleAz,
      excerpt: p[excerptKey] || p.excerptAz,
      image: p.image,
      readingTime: p.readingTime,
      createdAt: p.createdAt,
      author: author ? {
        id: author.id,
        name: author.name,
      } : null,
    };
  });

  return apiResponse.success(res, { data: shaped });
});

// GET /api/blog/:slug?locale=az
export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const locale = (req.query.locale as string) ?? 'az';

  const data = await PostRepository.getPostBySlug(slug);
  if (!data) {
    return apiResponse.error(res, { message: 'Məqalə tapılmadı', status: 404 });
  }

  const p = data.post;
  const author = data.author;

  const titleKey = `title${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as 'titleAz' | 'titleEn' | 'titleRu';
  const contentKey = `content${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as 'contentAz' | 'contentEn' | 'contentRu';
  const excerptKey = `excerpt${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as 'excerptAz' | 'excerptEn' | 'excerptRu';

  return apiResponse.success(res, {
    data: {
      id: p.id,
      slug: p.slug,
      title: p[titleKey] || p.titleAz,
      content: p[contentKey] || p.contentAz,
      excerpt: p[excerptKey] || p.excerptAz,
      image: p.image,
      readingTime: p.readingTime,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      author: author ? {
        id: author.id,
        name: author.name,
      } : null,
    },
  });
});

// Admin Controllers
export const listAllPostsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const posts = await PostRepository.getAllPosts({ publishedOnly: false });
  return apiResponse.success(res, { data: posts });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await PostRepository.createPost(req.body);
  return apiResponse.success(res, { data: post, status: 201 });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await PostRepository.updatePost(id, req.body);
  if (!post) return apiResponse.error(res, { message: 'Məqalə tapılmadı', status: 404 });
  return apiResponse.success(res, { data: post });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await PostRepository.deletePost(id);
  if (!post) return apiResponse.error(res, { message: 'Məqalə tapılmadı', status: 404 });
  return apiResponse.success(res, { message: 'Məqalə silindi' });
});

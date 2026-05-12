import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { getAllPosts, getPostBySlug } from '../repositories/post.repository.js';

// GET /api/blog?locale=az&excludeSlug=...&limit=10
export const listPosts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const locale = (req.query.locale as string) ?? 'az';
    const excludeSlug = req.query.excludeSlug as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const postsData = await getAllPosts({ excludeSlug, limit });

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiResponse.error(res, { message, status: 500 });
  }
});

// GET /api/blog/:slug?locale=az
export const getPost = asyncHandler(async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const locale = (req.query.locale as string) ?? 'az';

    const data = await getPostBySlug(slug);
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiResponse.error(res, { message, status: 500 });
  }
});

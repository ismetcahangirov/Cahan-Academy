import { Request, Response, NextFunction } from 'express';
import { FAQRepository } from '../repositories/faq.repository.js';
import { apiResponse } from '../utils/apiResponse.js';
import { z } from 'zod';

const faqRepo = new FAQRepository();

const faqSchema = z.object({
  question: z.object({
    az: z.string().min(1),
    en: z.string().min(1),
    ru: z.string().min(1),
  }),
  answer: z.object({
    az: z.string().min(1),
    en: z.string().min(1),
    ru: z.string().min(1),
  }),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const getFaqs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faqs = await faqRepo.getAll(true);
    res.status(200).json(apiResponse(true, 'FAQs retrieved successfully', faqs));
  } catch (error) {
    next(error);
  }
};

export const getAdminFaqs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faqs = await faqRepo.getAll(false);
    res.status(200).json(apiResponse(true, 'All FAQs retrieved successfully', faqs));
  } catch (error) {
    next(error);
  }
};

export const createFaq = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = faqSchema.parse(req.body);
    const faq = await faqRepo.create(validatedData as any);
    res.status(201).json(apiResponse(true, 'FAQ created successfully', faq));
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = faqSchema.partial().parse(req.body);
    const faq = await faqRepo.update(id, validatedData as any);
    if (!faq) {
      res.status(404).json(apiResponse(false, 'FAQ not found'));
      return;
    }
    res.status(200).json(apiResponse(true, 'FAQ updated successfully', faq));
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const faq = await faqRepo.delete(id);
    if (!faq) {
      res.status(404).json(apiResponse(false, 'FAQ not found'));
      return;
    }
    res.status(200).json(apiResponse(true, 'FAQ deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateFaqStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    const faq = await faqRepo.updateStatus(id, isActive);
    if (!faq) {
      res.status(404).json(apiResponse(false, 'FAQ not found'));
      return;
    }
    res.status(200).json(apiResponse(true, `FAQ ${isActive ? 'activated' : 'deactivated'} successfully`, faq));
  } catch (error) {
    next(error);
  }
};

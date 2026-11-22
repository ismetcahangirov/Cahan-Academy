import { Request, Response } from 'express';
import * as NewsletterRepository from '../repositories/newsletter.repository.js';
import { NewsletterSchema } from '../schemas/form.schema.js';
import { notify } from '../services/notify.js';
import { apiResponse } from '../utils/apiResponse.js';

export const subscribe = async (req: Request, res: Response) => {
  try {
    const validatedData = NewsletterSchema.parse(req.body);

    const subscription = await NewsletterRepository.subscribe(validatedData);

    // Notify admin
    await notify('newsletter', 'Yeni Newsletter Abunəliyi', validatedData);

    res.status(200).json(apiResponse(true, 'Abunəliyiniz uğurla tamamlandı', { email: subscription?.email }));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json(apiResponse(false, error.errors[0].message));
    }
    res.status(500).json(apiResponse(false, 'Server xətası baş verdi'));
  }
};

// Admin Controllers
export const getSubscribers = async (req: Request, res: Response) => {
  try {
    const subscribers = await NewsletterRepository.getAllSubscribers();
    res.status(200).json(apiResponse(true, 'Abunəçilər gətirildi', subscribers));
  } catch (_error) {
    res.status(500).json(apiResponse(false, 'Abunəçiləri gətirmək mümkün olmadı'));
  }
};

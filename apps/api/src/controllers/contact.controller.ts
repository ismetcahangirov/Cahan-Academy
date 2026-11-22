import { Request, Response } from 'express';
import * as ContactRepository from '../repositories/contact.repository.js';
import { ContactSchema } from '../schemas/form.schema.js';
import { notify } from '../services/notify.js';
import { apiResponse } from '../utils/apiResponse.js';
import { param } from '../utils/sanitize.js';

export const createContactMessage = async (req: Request, res: Response) => {
  try {
    const validatedData = ContactSchema.parse(req.body);

    const message = await ContactRepository.createContactMessage(validatedData);

    await notify('contact', `Yeni Əlaqə Mesajı: ${validatedData.subject}`, validatedData, {
      to: validatedData.email,
      subject: 'Mesajınız qeydə alındı',
      name: validatedData.name,
    });

    res.status(201).json(apiResponse(true, 'Mesajınız uğurla göndərildi', { id: message?.id }));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json(apiResponse(false, error.errors[0].message));
    }
    res.status(500).json(apiResponse(false, 'Server xətası baş verdi'));
  }
};

// Admin Controllers
export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await ContactRepository.getAllContactMessages();
    res.status(200).json(apiResponse(true, 'Mesajlar gətirildi', messages));
  } catch (_error) {
    res.status(500).json(apiResponse(false, 'Mesajları gətirmək mümkün olmadı'));
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const message = await ContactRepository.markAsRead(param(req, 'id'));
    if (!message) {
      return res.status(404).json(apiResponse(false, 'Mesaj tapılmadı'));
    }
    res.status(200).json(apiResponse(true, 'Mesaj oxunmuş kimi qeyd edildi', message));
  } catch (_error) {
    res.status(500).json(apiResponse(false, 'Xəta baş verdi'));
  }
};

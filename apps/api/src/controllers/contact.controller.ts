import { Request, Response } from 'express';
import * as ContactRepository from '../repositories/contact.repository.js';
import { ContactSchema } from '../schemas/form.schema.js';
import { sendMail } from '../services/email.service.js';
import { adminNotificationTemplate, userThankYouTemplate } from '../templates/notification.template.js';
import { env } from '../config/env.js';
import { apiResponse } from '../utils/apiResponse.js';

export const createContactMessage = async (req: Request, res: Response) => {
  try {
    const validatedData = ContactSchema.parse(req.body);

    const message = await ContactRepository.createContactMessage(validatedData);

    // Send emails
    await sendMail(
      env.NOTIFICATION_EMAIL,
      `Yeni Əlaqə Mesajı: ${validatedData.subject}`,
      adminNotificationTemplate('contact', validatedData)
    );

    await sendMail(
      validatedData.email,
      'Mesajınız qeydə alındı',
      userThankYouTemplate(validatedData.name)
    );

    res.status(201).json(apiResponse(true, 'Mesajınız uğurla göndərildi', message));
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
    const { id } = req.params;
    const message = await ContactRepository.markAsRead(id);
    if (!message) {
      return res.status(404).json(apiResponse(false, 'Mesaj tapılmadı'));
    }
    res.status(200).json(apiResponse(true, 'Mesaj oxunmuş kimi qeyd edildi', message));
  } catch (_error) {
    res.status(500).json(apiResponse(false, 'Xəta baş verdi'));
  }
};

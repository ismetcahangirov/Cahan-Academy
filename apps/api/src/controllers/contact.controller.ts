import { Request, Response } from 'express';
import * as ContactRepository from '../repositories/contact.repository.js';
import { ContactSchema } from '../schemas/form.schema.js';
import { sendMail } from '../services/email.service.js';
import { adminNotificationTemplate, userThankYouTemplate } from '../templates/notification.template.js';
import { env } from '../config/env.js';

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

    res.status(201).json({
      message: 'Mesajınız uğurla göndərildi',
      data: message,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Server xətası baş verdi' });
  }
};

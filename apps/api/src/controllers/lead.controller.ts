import { Request, Response } from 'express';
import * as LeadRepository from '../repositories/lead.repository.js';
import { LeadSchema } from '../schemas/form.schema.js';
import { sendMail } from '../services/email.service.js';
import { adminNotificationTemplate, userThankYouTemplate } from '../templates/notification.template.js';
import { env } from '../config/env.js';

export const createLead = async (req: Request, res: Response) => {
  try {
    const validatedData = LeadSchema.parse(req.body);

    const lead = await LeadRepository.createLead(validatedData);

    // Send emails
    await sendMail(
      env.NOTIFICATION_EMAIL,
      'Yeni Kurs Qeydiyyatı',
      adminNotificationTemplate('lead', validatedData)
    );

    await sendMail(
      validatedData.email,
      'Müraciətiniz qeydə alındı',
      userThankYouTemplate(validatedData.name)
    );

    res.status(201).json({
      message: 'Müraciət uğurla göndərildi',
      data: lead,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Server xətası baş verdi' });
  }
};

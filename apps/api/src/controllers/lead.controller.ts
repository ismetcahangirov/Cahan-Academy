import { Request, Response } from 'express';
import * as LeadRepository from '../repositories/lead.repository.js';
import { LeadSchema } from '../schemas/form.schema.js';
import { sendMail } from '../services/email.service.js';
import { adminNotificationTemplate, userThankYouTemplate } from '../templates/notification.template.js';
import { env } from '../config/env.js';
import { apiResponse } from '../utils/apiResponse.js';

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

    res.status(201).json(apiResponse(true, 'Müraciət uğurla göndərildi', lead));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json(apiResponse(false, error.errors[0].message));
    }
    res.status(500).json(apiResponse(false, 'Server xətası baş verdi'));
  }
};

// Admin Controllers
export const getLeads = async (req: Request, res: Response) => {
  try {
    const leads = await LeadRepository.getAllLeads();
    res.status(200).json(apiResponse(true, 'Müraciətlər gətirildi', leads));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Müraciətləri gətirmək mümkün olmadı'));
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const lead = await LeadRepository.updateLeadStatus(id, status);
    if (!lead) {
      return res.status(404).json(apiResponse(false, 'Müraciət tapılmadı'));
    }

    res.status(200).json(apiResponse(true, 'Status yeniləndi', lead));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Statusu yeniləmək mümkün olmadı'));
  }
};

export const exportLeadsCSV = async (req: Request, res: Response) => {
  try {
    const leads = await LeadRepository.getAllLeads();
    
    let csv = 'ID,Ad,Email,Telefon,Kurs,Status,Mənbə,Tarix\n';
    
    leads.forEach(l => {
      csv += `"${l.id}","${l.name}","${l.email}","${l.phone || ''}","${l.course || ''}","${l.status}","${l.source || ''}","${l.createdAt.toISOString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads-export.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json(apiResponse(false, 'CSV eksport xətası'));
  }
};

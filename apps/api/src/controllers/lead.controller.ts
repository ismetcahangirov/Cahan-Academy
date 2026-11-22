import { Request, Response } from 'express';
import * as LeadRepository from '../repositories/lead.repository.js';
import { LeadSchema, LeadStatusSchema } from '../schemas/form.schema.js';
import { notify } from '../services/notify.js';
import { apiResponse } from '../utils/apiResponse.js';
import { param, toCsv } from '../utils/sanitize.js';

export const createLead = async (req: Request, res: Response) => {
  try {
    const validatedData = LeadSchema.parse(req.body);

    const lead = await LeadRepository.createLead(validatedData);

    await notify('lead', 'Yeni Kurs Qeydiyyatı', validatedData, {
      to: validatedData.email,
      subject: 'Müraciətiniz qeydə alındı',
      name: validatedData.name,
    });

    // Only echo the id: the anonymous caller does not need status/notes/source.
    res.status(201).json(apiResponse(true, 'Müraciət uğurla göndərildi', { id: lead?.id }));
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
  } catch (_error) {
    res.status(500).json(apiResponse(false, 'Müraciətləri gətirmək mümkün olmadı'));
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const id = param(req, 'id');
    const parsed = LeadStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(apiResponse(false, parsed.error.errors[0].message));
    }
    const { status } = parsed.data;

    const lead = await LeadRepository.updateLeadStatus(id, status);
    if (!lead) {
      return res.status(404).json(apiResponse(false, 'Müraciət tapılmadı'));
    }

    res.status(200).json(apiResponse(true, 'Status yeniləndi', lead));
  } catch (_error) {
    res.status(500).json(apiResponse(false, 'Statusu yeniləmək mümkün olmadı'));
  }
};

export const exportLeadsCSV = async (req: Request, res: Response) => {
  try {
    const leads = await LeadRepository.getAllLeads();
    
    // Every cell is quoted/escaped and formula-like values are neutralised (CSV injection).
    const csv = toCsv([
      ['ID', 'Ad', 'Email', 'Telefon', 'Kurs', 'Status', 'Mənbə', 'Tarix'],
      ...leads.map((l) => [l.id, l.name, l.email, l.phone, l.course, l.status, l.source, l.createdAt]),
    ]);

    // UTF-8 BOM so Excel shows Azerbaijani letters correctly.
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=leads-export.csv');
    res.status(200).send('﻿' + csv);
  } catch (_error) {
    res.status(500).json(apiResponse(false, 'CSV eksport xətası'));
  }
};

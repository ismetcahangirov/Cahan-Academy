import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { leads, newsletterSubscribers, posts, contactMessages } from '../config/schema.js';
import { apiResponse } from '../utils/apiResponse.js';
import { count, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { adminRepository } from '../repositories/admin.repository.js';

export const getStats = async (req: Request, res: Response) => {
  try {
    const [leadsCount] = await db.select({ value: count() }).from(leads);
    const [subscribersCount] = await db.select({ value: count() }).from(newsletterSubscribers);
    const [postsCount] = await db.select({ value: count() }).from(posts);
    const [messagesCount] = await db.select({ value: count() }).from(contactMessages);

    // Get last 7 days of leads for chart
    const last7DaysLeads = await db.execute(sql`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as count
      FROM leads
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY date
      ORDER BY date ASC
    `);

    res.status(200).json(apiResponse(true, 'Statistikalar gətirildi', {
      counts: {
        leads: leadsCount.value,
        subscribers: subscribersCount.value,
        posts: postsCount.value,
        messages: messagesCount.value
      },
      chartData: last7DaysLeads.rows
    }));
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json(apiResponse(false, 'Statistikaları gətirmək mümkün olmadı'));
  }
};

export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await adminRepository.findAll();
    res.status(200).json(apiResponse(true, 'Adminlər siyahısı', admins));
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json(apiResponse(false, 'Adminləri gətirmək mümkün olmadı'));
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    // Only Super Admin can create other admins
    if (!(req as any).user?.isSuperAdmin) {
      return res.status(403).json(apiResponse(false, 'Yalnız Super Admin yeni istifadəçi yarada bilər'));
    }

    const { name, email, password, isSuperAdmin } = req.body;
    
    // Check if email exists
    const existingAdmin = await adminRepository.findByEmail(email);
    if (existingAdmin) {
      return res.status(400).json(apiResponse(false, 'Bu email ilə artıq hesab mövcuddur'));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newAdmin = await adminRepository.create({
      name,
      email,
      passwordHash,
      isSuperAdmin: isSuperAdmin || false
    });

    res.status(201).json(apiResponse(true, 'Admin uğurla yaradıldı', newAdmin));
  } catch (error: any) {
    console.error('Create admin error:', error);
    if (error.code === '23505') { // Postgres unique violation code
        return res.status(400).json(apiResponse(false, 'Bu email ilə artıq hesab mövcuddur'));
    }
    res.status(500).json(apiResponse(false, 'Admin yaratmaq mümkün olmadı'));
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const targetId = req.params.id;

    if (!(req as any).user?.isSuperAdmin) {
      return res.status(403).json(apiResponse(false, 'Yalnız Super Admin istifadəçi silə bilər'));
    }

    if (currentUserId === targetId) {
      return res.status(403).json(apiResponse(false, 'Öz hesabınızı silə bilməzsiniz'));
    }

    const targetAdmin = await adminRepository.findById(targetId);
    if (!targetAdmin) {
      return res.status(404).json(apiResponse(false, 'Admin tapılmadı'));
    }

    const totalAdmins = await adminRepository.count();
    if (totalAdmins <= 1) {
      return res.status(400).json(apiResponse(false, 'Sistemdəki son admin silinə bilməz'));
    }

    await adminRepository.delete(targetId);
    res.status(200).json(apiResponse(true, 'Admin uğurla silindi'));
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json(apiResponse(false, 'Admini silmək mümkün olmadı'));
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const { name, email } = req.body;

    if (!currentUserId) return res.status(401).json(apiResponse(false, 'İcazə yoxdur'));

    const existingAdmin = await adminRepository.findByEmail(email);
    if (existingAdmin && existingAdmin.id !== currentUserId) {
      return res.status(400).json(apiResponse(false, 'Bu email başqa hesaba aiddir'));
    }

    const updatedAdmin = await adminRepository.update(currentUserId, { name, email });
    res.status(200).json(apiResponse(true, 'Profil uğurla yeniləndi', updatedAdmin));
  } catch (error: any) {
    console.error('Update profile error:', error);
    if (error.code === '23505') { 
        return res.status(400).json(apiResponse(false, 'Bu email başqa hesaba aiddir'));
    }
    res.status(500).json(apiResponse(false, 'Profili yeniləmək mümkün olmadı'));
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!currentUserId) return res.status(401).json(apiResponse(false, 'İcazə yoxdur'));

    const admin = await adminRepository.findById(currentUserId);
    if (!admin) return res.status(404).json(apiResponse(false, 'İstifadəçi tapılmadı'));

    const isMatch = await bcrypt.compare(oldPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json(apiResponse(false, 'Mövcud şifrə yalnışdır'));
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await adminRepository.update(currentUserId, { passwordHash });

    // Clear refresh token cookie on successful password change
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    res.status(200).json(apiResponse(true, 'Şifrə uğurla dəyişdirildi. Zəhmət olmasa yenidən daxil olun.'));
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(apiResponse(false, 'Şifrəni dəyişmək mümkün olmadı'));
  }
};

import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import {
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '../repositories/teamMember.repository.js';
import { TeamMemberSchema } from '../schemas/form.schema.js';

// GET /api/team?locale=az
export const listTeamMembers = asyncHandler(async (req: Request, res: Response) => {
  const locale = (req.query.locale as string) ?? 'az';
  const members = await getAllTeamMembers();

  const positionKey = `position${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as any;

  const shaped = members.map((m: any) => ({
    id: m.id,
    name: m.name,
    image: m.image,
    position: m[positionKey] ?? m.positionAz,
    order: m.order,
  }));

  return apiResponse.success(res, { data: shaped });
});

// POST /api/team/admin
export const createTeamMemberAdmin = asyncHandler(async (req: Request, res: Response) => {
  const validated = TeamMemberSchema.parse(req.body);
  const newMember = await createTeamMember(validated);
  return apiResponse.success(res, { data: newMember, message: 'Komanda üzvü uğurla yaradıldı', status: 201 });
});

// PUT /api/team/admin/:id
export const updateTeamMemberAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validated = TeamMemberSchema.parse(req.body);
  const existing = await getTeamMemberById(id);
  if (!existing) {
    return apiResponse.error(res, { message: 'Komanda üzvü tapılmadı', status: 404 });
  }
  const updated = await updateTeamMember(id, validated);
  return apiResponse.success(res, { data: updated, message: 'Komanda üzvü uğurla yeniləndi' });
});

// DELETE /api/team/admin/:id
export const deleteTeamMemberAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await getTeamMemberById(id);
  if (!existing) {
    return apiResponse.error(res, { message: 'Komanda üzvü tapılmadı', status: 404 });
  }
  const deleted = await deleteTeamMember(id);
  return apiResponse.success(res, { data: deleted, message: 'Komanda üzvü uğurla silindi' });
});

import { db } from '../config/db.js';
import { teamMembers, NewTeamMember } from '../config/schema.js';
import { eq, asc } from 'drizzle-orm';

export const getAllTeamMembers = async () => {
  return await db.select().from(teamMembers).orderBy(asc(teamMembers.order));
};

export const getTeamMemberById = async (id: string) => {
  const result = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
};

export const createTeamMember = async (data: NewTeamMember) => {
  const [newMember] = await db.insert(teamMembers).values(data).returning();
  return newMember;
};

export const updateTeamMember = async (id: string, data: Partial<NewTeamMember>) => {
  const [updatedMember] = await db
    .update(teamMembers)
    .set(data)
    .where(eq(teamMembers.id, id))
    .returning();
  return updatedMember;
};

export const deleteTeamMember = async (id: string) => {
  const [deletedMember] = await db
    .delete(teamMembers)
    .where(eq(teamMembers.id, id))
    .returning();
  return deletedMember;
};

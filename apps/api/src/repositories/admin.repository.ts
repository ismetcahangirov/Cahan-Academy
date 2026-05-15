import { eq, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { adminUsers, AdminUser, NewAdminUser } from '../config/schema.js';

export class AdminRepository {
  async findAll() {
    return db.select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      isSuperAdmin: adminUsers.isSuperAdmin,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt
    }).from(adminUsers);
  }

  async findById(id: string) {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin;
  }

  async findByEmail(email: string) {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin;
  }

  async create(data: NewAdminUser) {
    const [newAdmin] = await db.insert(adminUsers).values(data).returning({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      isSuperAdmin: adminUsers.isSuperAdmin,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt
    });
    return newAdmin;
  }

  async update(id: string, data: Partial<NewAdminUser>) {
    const [updatedAdmin] = await db
      .update(adminUsers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(adminUsers.id, id))
      .returning({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        isSuperAdmin: adminUsers.isSuperAdmin,
        createdAt: adminUsers.createdAt,
        updatedAt: adminUsers.updatedAt
      });
    return updatedAdmin;
  }

  async delete(id: string) {
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
  }

  async count() {
    const [result] = await db.select({ count: sql<number>\`count(*)\` }).from(adminUsers);
    return result.count;
  }
}

export const adminRepository = new AdminRepository();

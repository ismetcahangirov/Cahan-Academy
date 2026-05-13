import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { leads, newsletterSubscribers, posts, contactMessages } from '../config/schema.js';
import { apiResponse } from '../utils/apiResponse.js';
import { count, sql } from 'drizzle-orm';

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

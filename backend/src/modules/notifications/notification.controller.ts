import { Request, Response } from 'express';
import pool from '../../config/db';

export async function savePushSubscription(req: Request, res: Response) {
  try {
    const { customer_id, subscription } = req.body;
    if (!customer_id || !subscription) {
      return res.status(400).json({ error: 'Missing customer_id or subscription' });
    }

    // Resolve Auth0 ID → internal UUID
    const profileResult = await pool.query(
      `SELECT id FROM profiles WHERE auth0_id = $1`,
      [customer_id]
    );
    const internalId = profileResult.rows[0]?.id;
    if (!internalId) return res.status(404).json({ error: 'Profile not found' });

    await pool.query(
      `INSERT INTO push_subscriptions (customer_id, subscription)
       VALUES ($1, $2)
       ON CONFLICT (customer_id) DO UPDATE SET subscription = $2`,
      [internalId, JSON.stringify(subscription)]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Save subscription error:', err);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
}//
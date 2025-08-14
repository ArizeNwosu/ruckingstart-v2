import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://knieisikcofqxxwkoygp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuaWVpc2lrY29mcXh4d2tveWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDE3ODUsImV4cCI6MjA3MDc3Nzc4NX0.fAwzqHI-OoXd4Ir0nGIbMLXI8LKRd-KdOeLtBNXaI_0'
);

// Vercel serverless function to retrieve plans from database
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId } = req.query;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    console.log('Retrieving plan from Supabase:', planId);

    // Query Supabase database
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('plan_id', planId)
      .single();

    if (error || !data) {
      console.log('Plan not found in Supabase, checking fallback storage');
      
      // Fallback to in-memory storage
      global.plans = global.plans || {};
      const planData = global.plans[planId];

      if (!planData) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      // Update access count in fallback storage
      planData.accessCount = (planData.accessCount || 0) + 1;
      planData.lastAccessed = new Date().toISOString();

      return res.status(200).json({
        success: true,
        responses: planData.responses,
        plan: planData.plan,
        source: 'fallback'
      });
    }

    // Update access count in database
    await supabase
      .from('plans')
      .update({ 
        accessed_count: (data.accessed_count || 0) + 1,
        last_accessed: new Date().toISOString()
      })
      .eq('plan_id', planId);

    console.log('Plan retrieved successfully from Supabase');

    return res.status(200).json({
      success: true,
      responses: data.user_responses,
      plan: data.plan_data,
      source: 'database'
    });

  } catch (error) {
    console.error('Plan retrieval error:', error);
    
    // Final fallback to in-memory storage
    try {
      global.plans = global.plans || {};
      const planData = global.plans[req.query.planId];

      if (!planData) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      return res.status(200).json({
        success: true,
        responses: planData.responses,
        plan: planData.plan,
        source: 'fallback'
      });
    } catch (fallbackError) {
      return res.status(500).json({ 
        error: 'Failed to retrieve plan',
        details: error.message 
      });
    }
  }
}
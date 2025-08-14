import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://knieisikcofqxxwkoygp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuaWVpc2lrY29mcXh4d2tveWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDE3ODUsImV4cCI6MjA3MDc3Nzc4NX0.fAwzqHI-OoXd4Ir0nGIbMLXI8LKRd-KdOeLtBNXaI_0'
);

// Vercel serverless function to save plans to database
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, responses, plan } = req.body;

    if (!planId || !responses || !plan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Saving plan to Supabase:', {
      planId,
      email: responses.email,
      name: responses.name
    });

    // Save to Supabase database
    const { data, error } = await supabase
      .from('plans')
      .insert([
        {
          plan_id: planId,
          user_email: responses.email || 'anonymous@ruckingstart.com',
          user_name: responses.name || 'Anonymous User',
          user_responses: responses,
          plan_data: plan,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      
      // Fallback to in-memory storage if database fails
      global.plans = global.plans || {};
      global.plans[planId] = {
        responses,
        plan,
        createdAt: new Date().toISOString()
      };
      
      return res.status(200).json({ 
        success: true, 
        message: 'Plan saved to fallback storage',
        planId,
        fallback: true
      });
    }

    console.log('Plan saved successfully to Supabase');

    return res.status(200).json({ 
      success: true, 
      message: 'Plan saved successfully',
      planId,
      data: data[0]
    });

  } catch (error) {
    console.error('Plan saving error:', error);
    
    // Final fallback to in-memory storage
    try {
      global.plans = global.plans || {};
      global.plans[req.body.planId] = {
        responses: req.body.responses,
        plan: req.body.plan,
        createdAt: new Date().toISOString()
      };
      
      return res.status(200).json({ 
        success: true, 
        message: 'Plan saved to fallback storage',
        planId: req.body.planId,
        fallback: true
      });
    } catch (fallbackError) {
      return res.status(500).json({ 
        error: 'Failed to save plan',
        details: error.message 
      });
    }
  }
}
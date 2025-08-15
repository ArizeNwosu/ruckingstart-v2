import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client
const supabase = createClient(
  'https://knieisikcofqxxwkoygp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuaWVpc2lrY29mcXh4d2tveWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDE3ODUsImV4cCI6MjA3MDc3Nzc4NX0.fAwzqHI-OoXd4Ir0nGIbMLXI8LKRd-KdOeLtBNXaI_0'
);

// Vercel serverless function to send emails
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to_email, to_name, plan_url, subject, message } = req.body;

    // Validate required fields
    if (!to_email || !to_name || !plan_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('Resend API key not configured, simulating email send');
      
      // Fallback to simulation if no API key
      const emailLog = {
        timestamp: new Date().toISOString(),
        to: to_email,
        name: to_name,
        plan_url: plan_url,
        status: 'simulated_success'
      };

      return res.status(200).json({ 
        success: true, 
        message: 'Email simulated successfully (no API key configured)',
        log: emailLog 
      });
    }

    // Create HTML email template
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <div style="background: #10b981; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 28px;">🎒</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Your Rucking Plan is Ready!</h1>
        </div>
        
        <div style="background: white; padding: 40px 20px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi <strong>${to_name}</strong>!</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Your personalized 12-week rucking training plan is ready! This custom program has been created specifically based on your fitness level, goals, and preferences.
          </p>
          
          <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">🎯 What's Included:</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>✅ Personalized training progression</li>
              <li>✅ Custom gear recommendations based on your budget</li>
              <li>✅ Beast Mode customization options</li>
              <li>✅ Progress tracking tools</li>
              <li>✅ Success tips and safety guidelines</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${plan_url}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; transition: transform 0.2s;">
              🚀 Access Your Plan Now
            </a>
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3b82f6;">
            <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 500;">
              💡 <strong>Pro Tip:</strong> Bookmark this link to access your plan anytime from any device. You can also use the progress tracker and Beast Mode features to customize your training!
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0;">
            Ready to start your rucking transformation? Your journey to increased strength, endurance, and mental toughness begins now!
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
            <p style="color: #374151; margin: 0 0 8px 0;">Best regards,</p>
            <p style="color: #10b981; font-weight: bold; margin: 0;">The RuckingStart Team</p>
          </div>
          
          <p style="font-size: 12px; color: #9ca3af; margin: 24px 0 0 0; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            Share this link with friends who might want to start their own rucking journey! 
            <br>Generated by RuckingStart - Your Personal Rucking Coach
          </p>
        </div>
      </div>
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: 'RuckingStart <noreply@ruckingstart.com>',
      to: [to_email],
      subject: subject || '🎒 Your Personalized Rucking Plan is Ready!',
      html: htmlContent,
      text: `Hi ${to_name}!\n\nYour personalized 12-week rucking training plan is ready!\n\nAccess your plan: ${plan_url}\n\nBest regards,\nThe RuckingStart Team`
    });

    console.log('Email sent successfully via Resend:', emailResponse);

    // Save email log to database
    try {
      const { error: logError } = await supabase
        .from('email_queue')
        .insert([{
          to_email: to_email,
          to_name: to_name,
          plan_url: plan_url,
          email_subject: subject || '🎒 Your Personalized Rucking Plan is Ready!',
          email_body: `Plan link sent to ${to_name}`,
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }]);

      if (logError) {
        console.error('Failed to log email to database:', logError);
      } else {
        console.log('Email logged to database successfully');
      }
    } catch (logError) {
      console.log('Failed to log email, but email was sent successfully:', logError);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      email_id: emailResponse.data?.id
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    // Log failed email to database
    try {
      await supabase
        .from('email_queue')
        .insert([{
          to_email: to_email || 'unknown',
          to_name: to_name || 'unknown',
          plan_url: plan_url || '',
          email_subject: subject || '🎒 Your Personalized Rucking Plan is Ready!',
          email_body: `Failed to send plan link`,
          status: 'failed',
          error_message: error.message,
          created_at: new Date().toISOString()
        }]);
    } catch (logError) {
      console.log('Failed to log email failure to database:', logError);
    }
    
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
}
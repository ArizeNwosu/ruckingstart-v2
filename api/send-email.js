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

    // For production, you would integrate with an email service like:
    // - SendGrid (recommended)
    // - Mailgun
    // - AWS SES
    // - Resend
    // - Postmark

    // Example with SendGrid (you'd need to install @sendgrid/mail):
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: to_email,
      from: 'noreply@ruckingstart.com', // verified sender
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">🎒 Your Personalized Rucking Plan is Ready!</h1>
          <p>Hi ${to_name}!</p>
          <p>Your personalized 12-week rucking training plan is ready! This custom program has been created specifically based on your fitness level, goals, and preferences.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>What's Included:</h3>
            <ul>
              <li>✅ Personalized training progression</li>
              <li>✅ Custom gear recommendations</li>
              <li>✅ Budget-appropriate equipment suggestions</li>
              <li>✅ Progress tracking tools</li>
            </ul>
          </div>
          
          <p><strong><a href="${plan_url}" style="color: #10b981; text-decoration: none;">👉 Access Your Plan Here</a></strong></p>
          
          <p>Bookmark this link to access your plan anytime. You can also use the progress tracker and other tools to monitor your rucking journey.</p>
          
          <p>Ready to start your rucking transformation?</p>
          
          <p>Best regards,<br>The RuckingStart Team</p>
          
          <p style="font-size: 12px; color: #666;">P.S. Share this link with friends who might want to start their own rucking journey!</p>
        </div>
      `
    };

    await sgMail.send(msg);
    */

    // For now, we'll simulate successful email sending
    // In production, replace this with actual email service integration
    console.log('Email would be sent to:', to_email);
    console.log('Plan URL:', plan_url);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For development/testing, we'll log the email details
    const emailLog = {
      timestamp: new Date().toISOString(),
      to: to_email,
      name: to_name,
      plan_url: plan_url,
      status: 'simulated_success'
    };

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      log: emailLog 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
}
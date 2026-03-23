import { Resend } from 'resend';
import twilio from 'twilio';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

export async function sendApprovalNotification(email: string, phone: string, companyName: string) {
  const results = {
    email: { success: false, error: null as any },
    sms: { success: false, error: null as any }
  };

  // 1. Send Email via Resend
  if (resend) {
    try {
      await resend.emails.send({
        from: 'Repair Wizard <onboarding@resend.dev>',
        to: email,
        subject: 'Partner Application Approved!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Congratulations!</h1>
            <p>Your partner application for <strong>${companyName}</strong> has been approved.</p>
            <p>You can now log in to your dashboard to manage your business profile and start receiving leads.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">This is an automated message from Repair Wizard.</p>
          </div>
        `
      });
      results.email.success = true;
    } catch (error) {
      console.error('Resend Error:', error);
      results.email.error = error;
    }
  } else {
    results.email.error = 'RESEND_API_KEY not configured';
  }

  // 2. Send SMS via Twilio
  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: `Congratulations! Your partner application for ${companyName} has been approved. Welcome to Repair Wizard!`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      results.sms.success = true;
    } catch (error) {
      console.error('Twilio Error:', error);
      results.sms.error = error;
    }
  } else {
    results.sms.error = 'Twilio credentials not configured';
  }

  return results;
}

export async function sendRejectionNotification(email: string, phone: string, companyName: string) {
  const results = {
    email: { success: false, error: null as any },
    sms: { success: false, error: null as any }
  };

  if (resend) {
    try {
      await resend.emails.send({
        from: 'Repair Wizard <onboarding@resend.dev>',
        to: email,
        subject: 'Partner Application Update',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">Application Update</h1>
            <p>Thank you for your interest in <strong>Repair Wizard</strong>.</p>
            <p>At this time, we are unable to approve your application for <strong>${companyName}</strong>.</p>
            <p>If you have any questions, please contact our support team.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">This is an automated message from Repair Wizard.</p>
          </div>
        `
      });
      results.email.success = true;
    } catch (error) {
      results.email.error = error;
    }
  }

  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: `Repair Wizard: Your application for ${companyName} was not approved at this time. Please contact support for details.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      results.sms.success = true;
    } catch (error) {
      results.sms.error = error;
    }
  }

  return results;
}

export async function sendVerificationNotification(email: string, phone: string, companyName: string, isVerified: boolean) {
  const results = {
    email: { success: false, error: null as any },
    sms: { success: false, error: null as any }
  };

  const status = isVerified ? 'Verified' : 'Unverified';
  const color = isVerified ? '#10b981' : '#ef4444';

  if (resend) {
    try {
      await resend.emails.send({
        from: 'Repair Wizard <onboarding@resend.dev>',
        to: email,
        subject: `Business Profile Status: ${status}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: ${color};">Status Update</h1>
            <p>Your business profile for <strong>${companyName}</strong> is now <strong>${status}</strong>.</p>
            <p>${isVerified ? 'Your profile will now be featured with a verified badge.' : 'Your profile has been marked as unverified. Please contact support if this is an error.'}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">This is an automated message from Repair Wizard.</p>
          </div>
        `
      });
      results.email.success = true;
    } catch (error) {
      results.email.error = error;
    }
  }

  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: `Repair Wizard: Your business profile for ${companyName} is now ${status}.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      results.sms.success = true;
    } catch (error) {
      results.sms.error = error;
    }
  }

  return results;
}

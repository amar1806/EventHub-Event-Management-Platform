import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    // For development, use a testing service like Mailtrap or logs
    const isDev = process.env.NODE_ENV === 'development';

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      // For development, allow self-signed certificates
      ...(isDev && {
        tls: {
          rejectUnauthorized: false
        }
      })
    });

    // Log configuration in development
    if (isDev) {
      console.log('Email configuration:', {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        secure: process.env.EMAIL_SERVER_SECURE === 'true',
        user: process.env.EMAIL_SERVER_USER ? `${process.env.EMAIL_SERVER_USER.substring(0, 3)}...` : undefined,
        recipient: options.to
      });
    }

    // Send mail
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    if (isDev) {
      console.log('Email sent:', info.messageId);
      console.log('Email details:', {
        messageId: info.messageId,
        envelope: info.envelope,
        accepted: info.accepted,
        rejected: info.rejected
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
} 
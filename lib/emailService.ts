import nodemailer from 'nodemailer';
import { createCanvas } from 'canvas';
import QRCode from 'qrcode';

export interface TicketData {
  ticketId: string;
  userEmail: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventTime: string;
  ticketType: string;
  seatNumber?: string;
  totalAmount: number;
  qrData: string;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  /**
   * Generate a ticket as JPG buffer
   */
  async generateTicketImage(ticketData: TicketData): Promise<Buffer> {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Header section
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, 800, 120);

    // EventHub Logo/Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EventHub', 400, 50);
    
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('Digital Event Ticket', 400, 80);

    // Event Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ticketData.eventTitle, 400, 160);

    // Event Details Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(50, 190, 500, 320);
    
    // Event Details
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'left';
    
    ctx.fillText('Event Details:', 70, 220);
    
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText(`Date: ${ticketData.eventDate}`, 70, 250);
    ctx.fillText(`Time: ${ticketData.eventTime}`, 70, 275);
    ctx.fillText(`Location: ${ticketData.eventLocation}`, 70, 300);
    
    ctx.fillText(`Ticket ID: ${ticketData.ticketId}`, 70, 340);
    ctx.fillText(`Attendee: ${ticketData.userName}`, 70, 365);
    ctx.fillText(`Type: ${ticketData.ticketType}`, 70, 390);
    
    if (ticketData.seatNumber) {
      ctx.fillText(`Seat: ${ticketData.seatNumber}`, 70, 415);
    }
    
    ctx.fillText(`Total: Rp ${ticketData.totalAmount.toLocaleString('id-ID')}`, 70, 440);

    // QR Code
    const qrCodeDataURL = await QRCode.toDataURL(ticketData.qrData, {
      width: 180,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Draw QR code (we'll simulate it as a white box with text for now)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(580, 200, 180, 180);
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(580, 200, 180, 180);
    
    ctx.fillStyle = '#333333';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QR CODE', 670, 295);
    ctx.fillText('Scan for', 670, 315);
    ctx.fillText('Verification', 670, 335);

    // Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Please present this ticket at the venue entrance', 400, 540);
    ctx.fillText('For support, contact us at support@eventhub.com', 400, 560);
    ctx.fillText('Thank you for choosing EventHub!', 400, 580);

    // Convert canvas to JPG buffer
    return canvas.toBuffer('image/jpeg', { quality: 0.9 });
  }

  /**
   * Send ticket email with JPG attachment
   */
  async sendTicketEmail(ticketData: TicketData): Promise<boolean> {
    try {
      // Generate ticket image
      const ticketImageBuffer = await this.generateTicketImage(ticketData);

      // Email content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Your EventHub Ticket</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎫 Your Ticket is Ready!</h1>
              <p>Payment approved - Welcome to ${ticketData.eventTitle}</p>
            </div>
            
            <div class="content">
              <p>Dear ${ticketData.userName},</p>
              
              <p>Great news! Your payment has been approved and your ticket is now ready. Please find your digital ticket attached as a JPG image.</p>
              
              <div class="ticket-info">
                <h3>📅 Event Details</h3>
                <p><strong>Event:</strong> ${ticketData.eventTitle}</p>
                <p><strong>Date:</strong> ${ticketData.eventDate}</p>
                <p><strong>Time:</strong> ${ticketData.eventTime}</p>
                <p><strong>Location:</strong> ${ticketData.eventLocation}</p>
                <p><strong>Ticket Type:</strong> ${ticketData.ticketType}</p>
                ${ticketData.seatNumber ? `<p><strong>Seat Number:</strong> ${ticketData.seatNumber}</p>` : ''}
              </div>

              <div class="ticket-info">
                <h3>🎟️ Ticket Information</h3>
                <p><strong>Ticket ID:</strong> ${ticketData.ticketId}</p>
                <p><strong>Total Amount:</strong> Rp ${ticketData.totalAmount.toLocaleString('id-ID')}</p>
              </div>

              <h3>📱 Important Instructions:</h3>
              <ul>
                <li>Please save the attached ticket image to your phone</li>
                <li>Present this ticket at the venue entrance</li>
                <li>The QR code will be scanned for verification</li>
                <li>Arrive at least 30 minutes before the event starts</li>
              </ul>

              <p>If you have any questions or need support, please don't hesitate to contact us.</p>
              
              <p>We're excited to see you at the event!</p>
              
              <p>Best regards,<br>
              The EventHub Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent from EventHub Event Management System<br>
              For support: support@eventhub.com | Visit: www.eventhub.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Dear ${ticketData.userName},

        Your payment has been approved! Please find your ticket for "${ticketData.eventTitle}" attached.

        Event Details:
        - Event: ${ticketData.eventTitle}
        - Date: ${ticketData.eventDate}
        - Time: ${ticketData.eventTime}
        - Location: ${ticketData.eventLocation}
        - Ticket ID: ${ticketData.ticketId}

        Please present this ticket at the venue entrance.

        Best regards,
        The EventHub Team
      `;

      const mailOptions = {
        from: `"EventHub" <${process.env.SMTP_FROM_EMAIL || 'muh.ghally@gmail.com'}>`,
        to: ticketData.userEmail,
        subject: `🎫 Your Ticket for ${ticketData.eventTitle} - Payment Approved!`,
        text: textContent,
        html: htmlContent,
        attachments: [
          {
            filename: `EventHub-Ticket-${ticketData.ticketId}.jpg`,
            content: ticketImageBuffer,
            contentType: 'image/jpeg'
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Ticket email sent successfully:', info.messageId);
      return true;

    } catch (error) {
      console.error('Error sending ticket email:', error);
      return false;
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmationEmail(
    userEmail: string, 
    userName: string, 
    eventTitle: string, 
    ticketId: string
  ): Promise<boolean> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Received!</h1>
              <p>Your payment is being processed</p>
            </div>
            
            <div class="content">
              <p>Dear ${userName},</p>
              
              <p>We have received your payment evidence for <strong>${eventTitle}</strong>.</p>
              
              <p><strong>Ticket ID:</strong> ${ticketId}</p>
              
              <p>Your payment is currently under review by our admin team. You will receive your digital ticket via email once the payment is approved (usually within 24 hours).</p>
              
              <p>Thank you for your patience!</p>
              
              <p>Best regards,<br>
              The EventHub Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"EventHub" <${process.env.SMTP_FROM_EMAIL || 'muh.ghally@gmail.com'}>`,
        to: userEmail,
        subject: `✅ Payment Received for ${eventTitle}`,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Payment confirmation email sent:', info.messageId);
      return true;

    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      return false;
    }
  }

  /**
   * Test email connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection successful');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

// Create singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    const config: EmailConfig = {
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: process.env.SMTP_USER || 'muh.ghally@gmail.com',
      smtpPass: process.env.SMTP_PASS || '',
      fromEmail: process.env.SMTP_FROM_EMAIL || 'muh.ghally@gmail.com',
      fromName: process.env.SMTP_FROM_NAME || 'EventHub'
    };

    emailService = new EmailService(config);
  }

  return emailService;
}

/**
 * Email Notification Service
 * Provider-agnostic email service supporting multiple providers
 * Similar to payment abstraction - can switch email providers easily
 */

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'sendgrid';
    this.initializeProvider();
  }

  /**
   * Initialize email provider based on configuration
   */
  initializeProvider() {
    switch (this.provider) {
      case 'sendgrid':
        this.sendgridKey = process.env.SENDGRID_API_KEY;
        if (this.sendgridKey) {
          console.log('✅ SendGrid email provider configured');
        } else {
          console.log('⚠️  SendGrid not configured (missing SENDGRID_API_KEY)');
        }
        break;
      
      case 'mailgun':
        this.mailgunKey = process.env.MAILGUN_API_KEY;
        this.mailgunDomain = process.env.MAILGUN_DOMAIN;
        if (this.mailgunKey && this.mailgunDomain) {
          console.log('✅ Mailgun email provider configured');
        } else {
          console.log('⚠️  Mailgun not configured');
        }
        break;
      
      case 'smtp':
        this.smtpConfig = {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        };
        if (this.smtpConfig.host) {
          console.log('✅ SMTP email provider configured');
        } else {
          console.log('⚠️  SMTP not configured');
        }
        break;
      
      default:
        console.log('⚠️  No email provider configured - emails will be logged only');
    }
  }

  /**
   * Send email (provider-agnostic)
   */
  async sendEmail(params) {
    const { to, subject, html, text, from = process.env.FROM_EMAIL || 'noreply@rapidcrm.com' } = params;

    // Log email for debugging
    console.log(`📧 Sending email via ${this.provider}:`, {
      to,
      subject,
      from
    });

    try {
      switch (this.provider) {
        case 'sendgrid':
          return await this.sendViaSendGrid({ to, subject, html, text, from });
        
        case 'mailgun':
          return await this.sendViaMailgun({ to, subject, html, text, from });
        
        case 'smtp':
          return await this.sendViaSMTP({ to, subject, html, text, from });
        
        default:
          // No provider configured - just log
          console.log('📧 Email content:', { to, subject, textPreview: text?.substring(0, 100) });
          return { success: true, mock: true, provider: 'none' };
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send via SendGrid
   */
  async sendViaSendGrid(params) {
    if (!this.sendgridKey) {
      console.log('⚠️  SendGrid not configured - email not sent');
      return { success: false, error: 'SendGrid not configured', mock: true };
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sendgridKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: params.to }],
            subject: params.subject
          }],
          from: { email: params.from },
          content: [
            { type: 'text/html', value: params.html || params.text },
            { type: 'text/plain', value: params.text || '' }
          ]
        })
      });

      if (response.ok) {
        console.log('✅ Email sent via SendGrid');
        return { success: true, provider: 'sendgrid' };
      } else {
        const error = await response.text();
        console.error('❌ SendGrid error:', error);
        return { success: false, error, provider: 'sendgrid' };
      }
    } catch (error) {
      console.error('❌ SendGrid exception:', error);
      return { success: false, error: error.message, provider: 'sendgrid' };
    }
  }

  /**
   * Send via Mailgun
   */
  async sendViaMailgun(params) {
    if (!this.mailgunKey || !this.mailgunDomain) {
      console.log('⚠️  Mailgun not configured - email not sent');
      return { success: false, error: 'Mailgun not configured', mock: true };
    }

    // Mailgun implementation here
    console.log('📧 Would send via Mailgun (implementation pending)');
    return { success: true, mock: true, provider: 'mailgun' };
  }

  /**
   * Send via SMTP
   */
  async sendViaSMTP(params) {
    if (!this.smtpConfig.host) {
      console.log('⚠️  SMTP not configured - email not sent');
      return { success: false, error: 'SMTP not configured', mock: true };
    }

    // SMTP implementation here  
    console.log('📧 Would send via SMTP (implementation pending)');
    return { success: true, mock: true, provider: 'smtp' };
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(params) {
    const { customerEmail, customerName, amount, services, dealId } = params;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Payment Confirmed!</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for your payment of <strong>$${amount}</strong>.</p>
        
        <h3 style="color: #374151;">Services Purchased:</h3>
        <ul>
          ${services.map(s => `<li>${s}</li>`).join('')}
        </ul>
        
        <p>We're processing your registrations now. You'll receive updates as we progress.</p>
        
        <p style="margin-top: 30px;">
          <strong>Order ID:</strong> ${dealId}
        </p>
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
          Questions? Reply to this email or contact us at support@rapidcrm.com
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: customerEmail,
      subject: 'Payment Confirmed - Registration Processing Started',
      html,
      text: `Payment Confirmed! Thank you for your payment of $${amount}. We're processing your registrations: ${services.join(', ')}. Order ID: ${dealId}`
    });
  }

  /**
   * Send renewal reminder email
   */
  async sendRenewalReminder(params) {
    const { customerEmail, customerName, serviceName, renewalDate, renewalPrice } = params;

    const daysUntil = Math.ceil((new Date(renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Renewal Reminder</h2>
        <p>Hi ${customerName},</p>
        <p>Your <strong>${serviceName}</strong> renewal is coming up in <strong>${daysUntil} days</strong>.</p>
        
        <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0;"><strong>Renewal Date:</strong> ${new Date(renewalDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0 0 0;"><strong>Renewal Cost:</strong> $${renewalPrice}</p>
        </div>
        
        <p>To renew, simply login to your client portal or contact us.</p>
        
        <a href="${process.env.BASE_URL}/client-login" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px;">
          Renew Now
        </a>
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
          Questions? Contact us at support@rapidcrm.com
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: customerEmail,
      subject: `Renewal Reminder: ${serviceName} - ${daysUntil} days`,
      html,
      text: `Renewal Reminder: Your ${serviceName} renewal is due in ${daysUntil} days (${renewalDate}). Renewal cost: $${renewalPrice}. Login to renew: ${process.env.BASE_URL}/client-login`
    });
  }

  /**
   * Send workflow completion notification
   */
  async sendWorkflowCompletionNotification(params) {
    const { customerEmail, customerName, workflowType, result } = params;

    const serviceNames = {
      'usdot_filing': 'USDOT Registration',
      'mc_filing': 'MC Number Application',
      'renewal_reminder': 'Renewal Processing'
    };

    const serviceName = serviceNames[workflowType] || workflowType;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">✅ Registration Update</h2>
        <p>Hi ${customerName},</p>
        <p>Great news! We've completed the ${serviceName} process.</p>
        
        ${result.usdotNumber ? `
          <div style="background: #d1fae5; padding: 15px; border-left: 4px solid #059669; margin: 20px 0;">
            <p style="margin: 0;"><strong>Your USDOT Number:</strong> ${result.usdotNumber}</p>
          </div>
        ` : ''}
        
        <p>You can view your registration details in the client portal.</p>
        
        <a href="${process.env.BASE_URL}/client-login" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px;">
          View Portal
        </a>
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
          Questions? Contact us at support@rapidcrm.com
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: customerEmail,
      subject: `✅ ${serviceName} Complete`,
      html,
      text: `${serviceName} has been completed! Login to view details: ${process.env.BASE_URL}/client-login`
    });
  }
}

module.exports = EmailService;










/**
 * SMS Notification Service
 * Provider-agnostic SMS service supporting Twilio and other providers
 */

class SMSService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'twilio';
    this.initializeProvider();
  }

  /**
   * Initialize SMS provider
   */
  initializeProvider() {
    switch (this.provider) {
      case 'twilio':
        this.twilioSid = process.env.TWILIO_ACCOUNT_SID;
        this.twilioToken = process.env.TWILIO_AUTH_TOKEN;
        this.twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        
        if (this.twilioSid && this.twilioToken && this.twilioPhone) {
          console.log('✅ Twilio SMS provider configured');
        } else {
          console.log('⚠️  Twilio not configured (missing credentials)');
        }
        break;
      
      default:
        console.log('⚠️  No SMS provider configured - SMS will be logged only');
    }
  }

  /**
   * Send SMS (provider-agnostic)
   */
  async sendSMS(params) {
    const { to, message } = params;

    console.log(`📱 Sending SMS to ${to}:`, message.substring(0, 50) + '...');

    try {
      switch (this.provider) {
        case 'twilio':
          return await this.sendViaTwilio({ to, message });
        
        default:
          console.log('📱 SMS content:', { to, message });
          return { success: true, mock: true, provider: 'none' };
      }
    } catch (error) {
      console.error('❌ Error sending SMS:', error);
      throw error;
    }
  }

  /**
   * Send via Twilio
   */
  async sendViaTwilio(params) {
    if (!this.twilioSid || !this.twilioToken || !this.twilioPhone) {
      console.log('⚠️  Twilio not configured - SMS not sent');
      return { success: false, error: 'Twilio not configured', mock: true };
    }

    try {
      const auth = Buffer.from(`${this.twilioSid}:${this.twilioToken}`).toString('base64');
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: params.to,
            From: this.twilioPhone,
            Body: params.message
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ SMS sent via Twilio:', data.sid);
        return { success: true, provider: 'twilio', sid: data.sid };
      } else {
        const error = await response.json();
        console.error('❌ Twilio error:', error);
        return { success: false, error: error.message, provider: 'twilio' };
      }
    } catch (error) {
      console.error('❌ Twilio exception:', error);
      return { success: false, error: error.message, provider: 'twilio' };
    }
  }

  /**
   * Send renewal reminder SMS
   */
  async sendRenewalReminderSMS(params) {
    const { phone, customerName, serviceName, renewalDate } = params;
    const daysUntil = Math.ceil((new Date(renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const message = `Hi ${customerName}! Your ${serviceName} renewal is due in ${daysUntil} days (${new Date(renewalDate).toLocaleDateString()}). Login to renew: ${process.env.BASE_URL}/client-login - Rapid CRM`;

    return await this.sendSMS({ to: phone, message });
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmationSMS(params) {
    const { phone, customerName, amount, services } = params;

    const message = `Hi ${customerName}! Payment of $${amount} received. We're processing: ${services.join(', ')}. Check status: ${process.env.BASE_URL}/client-login - Rapid CRM`;

    return await this.sendSMS({ to: phone, message });
  }

  /**
   * Send workflow completion SMS
   */
  async sendWorkflowCompletionSMS(params) {
    const { phone, customerName, workflowType, result } = params;

    const serviceNames = {
      'usdot_filing': 'USDOT Registration',
      'mc_filing': 'MC Number',
      'renewal_reminder': 'Renewal'
    };

    const serviceName = serviceNames[workflowType] || workflowType;
    let message = `Hi ${customerName}! Your ${serviceName} has been completed.`;

    if (result.usdotNumber) {
      message += ` USDOT #${result.usdotNumber}`;
    }

    message += ` Login for details: ${process.env.BASE_URL}/client-login - Rapid CRM`;

    return await this.sendSMS({ to: phone, message });
  }
}

module.exports = SMSService;










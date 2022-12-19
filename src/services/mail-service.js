const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to, message, title) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: title,
      text: '',
      html: `
                    <div>
                       ${message}
                    </div>
                `,
    });
  }
}

module.exports = new MailService();

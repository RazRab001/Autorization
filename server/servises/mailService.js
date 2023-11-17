const nodemailer = require('nodemailer');
require('dotenv').config()
class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendActivationMail(email, link) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to: email, // Change 'email' to 'to'
                subject: "Account activation on " + process.env.API_URL,
                text: '',
                html: `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href='${link}'>${link}</a>
                    </div>
                `
            });
            console.log('Activation email sent successfully');
        } catch (error) {
            console.error('Error sending activation email:', error);
        }
    }
}

module.exports = new MailService();

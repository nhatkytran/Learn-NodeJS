const path = require('path');
const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

const {
  NODE_ENV,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_FROM,
  EMAIL_FROM_NAME,
  SENDGRID_NAME,
  SENDGRID_PASSWORD,
} = process.env;

class Email {
  constructor(user, url) {
    this.from = `${EMAIL_FROM_NAME} < ${EMAIL_FROM} >`;
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  newTransport() {
    let transporter;
    if (NODE_ENV === 'development')
      transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        auth: {
          user: EMAIL_USERNAME,
          pass: EMAIL_PASSWORD,
        },
      });
    if (NODE_ENV === 'production')
      transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: SENDGRID_NAME,
          pass: SENDGRID_PASSWORD,
        },
      });

    return transporter;
  }

  async send(template, subject) {
    const filepath = path.join(
      __dirname,
      '..',
      'views',
      'email',
      `${template}.pug`
    );
    const html = pug.renderFile(filepath, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html, {
        wordwrap: null,
      }),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

  async sendEmailConfirm() {
    await this.send(
      'emailConfirm',
      'Your email confirm token (valid for only 2 minutes)'
    );
  }
}

module.exports = Email;

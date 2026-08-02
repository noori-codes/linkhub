import nodemailer from "nodemailer";

interface EmailUser {
  firstName: string;
  email: string;
}

class Email {
  private to: string;
  private firstName: string;
  private url: string;
  private from: string;

  constructor(user: EmailUser, url: string) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `LinkHub <${process.env.EMAIL_FROM}>`;
  }

  private newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // true only for port 465
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private async send(subject: string, html: string) {
    await this.newTransport().sendMail({
      from: this.from,
      to: this.to,
      subject,
      html,
    });
  }

  async sendPasswordReset() {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Hello, ${this.firstName} 👋</h2>

        <p>You requested to reset your LinkHub password.</p>

        <p>
          Click the button below to choose a new password.
        </p>

        <p style="margin: 30px 0;">
          <a
            href="${this.url}"
            style="
              background:#2563eb;
              color:#fff;
              text-decoration:none;
              padding:12px 24px;
              border-radius:6px;
              display:inline-block;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link is valid for <strong>10 minutes</strong>.
        </p>

        <p>
          If you didn't request a password reset, you can safely ignore this email.
        </p>

        <hr>

        <p style="color:#666;font-size:14px;">
          LinkHub Team
        </p>
      </div>
    `;

    await this.send("Reset your LinkHub password", html);
  }

  // Soft verify — account works before clicking; this just marks emailVerified
  async sendEmailVerify() {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Welcome to LinkHub, ${this.firstName}</h2>

        <p>Confirm your email so we know it’s really you.</p>

        <p style="margin: 30px 0;">
          <a
            href="${this.url}"
            style="
              background:#c47a1a;
              color:#fff;
              text-decoration:none;
              padding:12px 24px;
              border-radius:6px;
              display:inline-block;
            "
          >
            Verify email
          </a>
        </p>

        <p>This link is valid for <strong>24 hours</strong>.</p>

        <p style="color:#666;font-size:14px;">LinkHub Team</p>
      </div>
    `;

    await this.send("Verify your LinkHub email", html);
  }
}

export default Email;

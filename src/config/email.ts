import path from "node:path";
import nodemailer from "nodemailer";
import pug from "pug";
import { convert } from "html-to-text";
import type { IUser } from "../models/user.model.js";

class Email {
  private to: string;
  private firstName: string;
  private url: string;
  private from: string;

  constructor(user: IUser, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = "Imran Noori <imran@noorullah.dev>";
  }

  private newTransport() {
    return nodemailer.createTransport({
      host: "mail.noorullah.dev",
      port: 587,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: "imran@noorullah.dev",
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template: string, subject: string) {
    const html = pug.renderFile(
      path.join(process.cwd(), "src", "views", "email", `${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)",
    );
  }
}

export default Email;

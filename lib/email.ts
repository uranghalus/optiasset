import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API!);

export async function sendEmail(to: string, subject: string, html: string) {
  await sgMail.send({
    to,
    from: process.env.EMAIL_FROM!,
    subject,
    html,
  });
}

import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function normalizeRecipients(to) {
  if (Array.isArray(to)) {
    return to.map((recipient) => String(recipient || "").trim()).filter(Boolean);
  }

  const recipient = String(to || "").trim();
  return recipient ? [recipient] : [];
}

function maskEmail(email) {
  const value = String(email || "");
  const [name = "", domain = ""] = value.split("@");

  if (!name || !domain) {
    return value ? "***" : "";
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

export async function sendEmail({ to, subject, text, html }) {
  const recipients = normalizeRecipients(to);

  if (!recipients.length || !subject || (!text && !html)) {
    console.warn("Email not sent: missing required email fields.", {
      hasRecipients: recipients.length > 0,
      hasSubject: Boolean(subject),
      hasBody: Boolean(text || html),
    });
    return { ok: false, skipped: true, reason: "missing_email_fields" };
  }

  const from = process.env.EMAIL_FROM || "Vyntra <noreply@vyntra.app>";
  const maskedRecipients = recipients.map(maskEmail);

  console.info("Email send attempt.", {
    to: maskedRecipients,
    subject,
    from,
    smtpHost: process.env.SMTP_HOST || "",
    smtpPort: process.env.SMTP_PORT || "",
    hasSmtpUser: Boolean(process.env.SMTP_USER),
    hasSmtpPass: Boolean(process.env.SMTP_PASS),
    hasEmailFrom: Boolean(process.env.EMAIL_FROM),
  });

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("Email not sent: missing SMTP configuration.", {
      hasSmtpHost: Boolean(process.env.SMTP_HOST),
      hasSmtpUser: Boolean(process.env.SMTP_USER),
      hasSmtpPass: Boolean(process.env.SMTP_PASS),
    });
    return { ok: false, skipped: true, reason: "missing_smtp_config" };
  }

  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from,
      to: recipients.join(", "),
      subject,
      text,
      html,
    });

    console.info("Email sent successfully.", {
      to: maskedRecipients,
      subject,
      messageId: info.messageId || null,
    });

    return { ok: true, data: { messageId: info.messageId } };
  } catch (error) {
    console.error("Email send failed.", {
      to: maskedRecipients,
      subject,
      message: error?.message || String(error),
      code: error?.code || "",
    });
    throw error;
  }
}

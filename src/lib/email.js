const DEFAULT_RESEND_ENDPOINT = "https://api.resend.com/emails";

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || "",
    endpoint: process.env.EMAIL_API_URL || DEFAULT_RESEND_ENDPOINT,
    from: process.env.EMAIL_FROM || "Vyntra <onboarding@resend.dev>",
  };
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

  const { apiKey, endpoint, from } = getEmailConfig();
  const maskedRecipients = recipients.map(maskEmail);

  console.info("Email send attempt.", {
    to: maskedRecipients,
    subject,
    endpoint,
    from,
    hasResendApiKey: Boolean(process.env.RESEND_API_KEY),
    hasEmailApiKey: Boolean(process.env.EMAIL_API_KEY),
  });

  if (!apiKey) {
    console.warn("Email not sent: missing RESEND_API_KEY or EMAIL_API_KEY.");
    return { ok: false, skipped: true, reason: "missing_api_key" };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Email send failed.", {
      to: maskedRecipients,
      subject,
      status: response.status,
      response: errorText,
    });
    throw new Error(errorText || "Unable to send email");
  }

  const data = await response.json().catch(() => null);

  console.info("Email sent successfully.", {
    to: maskedRecipients,
    subject,
    resendId: data?.id || null,
  });

  return { ok: true, data };
}

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

export async function sendEmail({ to, subject, text, html }) {
  const recipients = normalizeRecipients(to);

  if (!recipients.length || !subject || (!text && !html)) {
    return { ok: false, skipped: true, reason: "missing_email_fields" };
  }

  const { apiKey, endpoint, from } = getEmailConfig();

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
    throw new Error(errorText || "Unable to send email");
  }

  return { ok: true, data: await response.json().catch(() => null) };
}

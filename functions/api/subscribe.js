// Cloudflare Pages Function — newsletter signup, forwards to Brevo.
// Route: POST /api/subscribe
//
// Requires environment variables set in the Cloudflare Pages project
// (Dashboard → Workers & Pages → trade90-sizer → Settings → Environment variables):
//   BREVO_API_KEY  — Brevo API key with "Contacts" write access
//   BREVO_LIST_ID  — numeric ID of the Brevo contact list to subscribe to
//
// Until both are set, the endpoint responds with a clear "not configured" error
// instead of silently failing.

function htmlResponse(status, message) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>TRADE90</title></head>
<body style="font-family:-apple-system,sans-serif;background:#020617;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
<div style="text-align:center;max-width:26rem;padding:2rem;">
<p style="font-size:0.95rem;line-height:1.7;margin-bottom:1.5rem;">${message}</p>
<a href="/" style="color:#10b981;text-decoration:none;font-weight:700;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;">Return to TRADE90 →</a>
</div>
</body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const contentType = request.headers.get("content-type") || "";
  const wantsJson = (request.headers.get("accept") || "").includes("application/json");

  let email = "";
  let honeypot = "";

  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = (body.email || "").trim();
      honeypot = (body.website || "").trim();
    } else {
      const form = await request.formData();
      email = (form.get("email") || "").toString().trim();
      honeypot = (form.get("website") || "").toString().trim();
    }
  } catch {
    return wantsJson
      ? jsonResponse(400, { ok: false, error: "Invalid request." })
      : htmlResponse(400, "Something went wrong reading your submission. Please go back and try again.");
  }

  // Honeypot: a hidden field bots fill in and humans never see.
  // Report success without actually subscribing the (likely fake) address.
  if (honeypot) {
    return wantsJson ? jsonResponse(200, { ok: true }) : htmlResponse(200, "Thanks — you're on the list.");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    return wantsJson
      ? jsonResponse(400, { ok: false, error: "Enter a valid email address." })
      : htmlResponse(400, "Please go back and enter a valid email address.");
  }

  if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID) {
    return wantsJson
      ? jsonResponse(500, { ok: false, error: "Newsletter signup is not configured yet." })
      : htmlResponse(500, "Newsletter signup isn't configured yet — please try again later.");
  }

  let brevoRes;
  try {
    brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [Number(env.BREVO_LIST_ID)],
        updateEnabled: true,
      }),
    });
  } catch {
    return wantsJson
      ? jsonResponse(502, { ok: false, error: "Could not reach the subscription service." })
      : htmlResponse(502, "Something went wrong. Please try again in a moment.");
  }

  // Brevo returns 201 on new contact, or 400 duplicate_parameter if the
  // contact already exists — both are a success from the subscriber's view.
  if (brevoRes.ok) {
    return wantsJson ? jsonResponse(200, { ok: true }) : htmlResponse(200, "You're on the list. Check your inbox to confirm.");
  }

  let errCode = "";
  try {
    const errBody = await brevoRes.json();
    errCode = errBody.code || "";
  } catch {}

  if (errCode === "duplicate_parameter") {
    return wantsJson ? jsonResponse(200, { ok: true }) : htmlResponse(200, "You're already on the list.");
  }

  return wantsJson
    ? jsonResponse(502, { ok: false, error: "Could not complete signup. Please try again." })
    : htmlResponse(502, "Something went wrong. Please try again in a moment.");
}

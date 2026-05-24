import { createClient } from "@supabase/supabase-js";
import http from "http";

const SUPABASE_URL = "https://crkmwxtqpyvigspjvdje.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNya213eHRxcHl2aWdzcGp2ZGplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI1MzM3NywiZXhwIjoyMDk0ODI5Mzc3fQ.IltilHQJDkRtTnEM40h9d-FKFcg4mqe-K2lX9T3CxZ4";
const ADMIN_EMAIL = "washifur.mail@gmail.com";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getAdminToken() {
  // Generate a magic link to get an access token for the admin user
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: ADMIN_EMAIL,
  });
  if (error) throw new Error("generateLink failed: " + error.message);

  const props = data.properties;
  console.log("Session props keys:", Object.keys(props));

  if (props.access_token) {
    console.log("Got access_token directly.");
    return props.access_token;
  }

  // Fallback: exchange the OTP token via the REST API
  const actionUrl = props.action_link;
  const url = new URL(actionUrl);
  const hrefToken = url.searchParams.get("token");
  const type = url.searchParams.get("type") || "magiclink";
  console.log("Exchanging OTP token, type:", type);

  const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SERVICE_KEY },
    body: JSON.stringify({ token: hrefToken, type, email: ADMIN_EMAIL }),
  });
  const verifyData = await verifyRes.json();
  console.log("Verify response status:", verifyRes.status);
  if (verifyData.access_token) return verifyData.access_token;
  throw new Error("Could not get access_token: " + JSON.stringify(verifyData));
}

function testUploadAPI(token) {
  // 1x1 transparent PNG
  const pngData = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  const boundary = "TestBoundary" + Date.now();
  const CRLF = "\r\n";
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}${CRLF}Content-Disposition: form-data; name="file"; filename="test.png"${CRLF}Content-Type: image/png${CRLF}${CRLF}`
    ),
    pngData,
    Buffer.from(`${CRLF}--${boundary}--${CRLF}`),
  ]);

  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/admin/products/upload",
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": body.length,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          console.log("\n=== Upload API Result ===");
          console.log("HTTP Status:", res.statusCode);
          console.log("Response body:", raw);
          try {
            const json = JSON.parse(raw);
            if (json.url) console.log("\n✅ UPLOAD SUCCEEDED! URL:", json.url);
            else console.log("\n❌ UPLOAD FAILED. Error:", json.error);
          } catch {
            console.log("Raw (not JSON):", raw);
          }
          resolve();
        });
      }
    );
    req.on("error", (e) => {
      console.log("Request error:", e.message);
      resolve();
    });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("Getting admin token for:", ADMIN_EMAIL);
  const token = await getAdminToken();
  console.log("Token (first 40 chars):", token.slice(0, 40) + "...");
  await testUploadAPI(token);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});

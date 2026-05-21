import { google } from "googleapis";

type SheetOrderRow = {
  orderId: string;
  createdAt: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  items: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  notes?: string;
};

export async function appendOrderToGoogleSheet(row: SheetOrderRow) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const range = process.env.GOOGLE_SHEETS_RANGE || "Orders!A:Z";

  if (!spreadsheetId || !clientEmail || !privateKey) {
    return { ok: false, reason: "Google Sheets env vars are missing." };
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        row.orderId,
        row.createdAt,
        row.customerName,
        row.email,
        row.phone,
        row.address,
        row.city,
        row.items,
        row.subtotal,
        row.deliveryFee,
        row.total,
        row.status,
        row.notes || ""
      ]]
    }
  });

  return { ok: true };
}

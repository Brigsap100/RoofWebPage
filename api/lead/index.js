/* Kodiak CRM Lead intake — POST /api/lead
   Accepts a lead from the public website forms (contact + careers) and
   stores it in dbo.Leads. Body JSON:
   { source, name, company, email, phone, service, position, message }
   Status defaults to "new", CreatedDate to today, Owner to null (DB defaults). */
const sql = require("mssql");

let pool; // reused across warm invocations
async function getPool() {
  if (pool && pool.connected) return pool;
  pool = await sql.connect(process.env.DATABASE_CONNECTION_STRING);
  return pool;
}

// Coerce to a trimmed string and cap at max length (null/undefined → "").
function clean(v, max) {
  if (v === null || v === undefined) return "";
  return String(v).trim().slice(0, max);
}

module.exports = async function (context, req) {
  // ---- Parse body (may arrive as a raw JSON string) --------------------
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = body.length ? JSON.parse(body) : {};
    } catch (e) {
      context.res = { status: 400,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: { ok: false, error: "Invalid JSON body" } };
      return;
    }
  }
  if (!body || typeof body !== "object") body = {};

  // ---- Extract, coerce, trim, cap to column sizes ----------------------
  let source  = clean(body.source, 40);
  const name    = clean(body.name, 200);
  const company = clean(body.company, 200);
  const email   = clean(body.email, 200);
  const phone   = clean(body.phone, 30);
  const service = clean(body.service, 120);
  const position = clean(body.position, 120);
  const message = clean(body.message, 4000);

  // ---- Validation ------------------------------------------------------
  if (!source) source = "website-contact";
  if (!name && !email) {
    context.res = { status: 400,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: { error: "name or email required" } };
    return;
  }

  // ---- Parameterized INSERT (Status/CreatedDate use column defaults) ---
  try {
    const p = await getPool();
    const result = await p.request()
      .input("source", sql.NVarChar(40), source)
      .input("name", sql.NVarChar(200), name)
      .input("company", sql.NVarChar(200), company)
      .input("email", sql.NVarChar(200), email)
      .input("phone", sql.NVarChar(30), phone)
      .input("service", sql.NVarChar(120), service)
      .input("position", sql.NVarChar(120), position)
      .input("message", sql.NVarChar(sql.MAX), message)
      .query(`
        INSERT INTO dbo.Leads (Source, Name, Company, Email, Phone, Service, Position, Message)
        OUTPUT INSERTED.Id AS id
        VALUES (@source, @name, @company, @email, @phone, @service, @position, @message)`);

    const newId = result.recordset && result.recordset[0] ? result.recordset[0].id : null;
    context.res = { status: 201,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: { ok: true, id: newId } };
  } catch (e) {
    context.log.error("Lead insert error:", e.message);
    context.res = { status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: { ok: false, error: "Could not save lead" } };
  }
};

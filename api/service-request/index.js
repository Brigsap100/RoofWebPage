/* Kodiak CRM Service Request intake — POST /api/service-request
   Accepts a service/leak request from the public website and stores it as a
   work order in dbo.WorkOrders. Body JSON:
   { company, name, phone, email, building, leakLocation, problem, emergency, urgent }
   The company name is fuzzy-matched to dbo.Accounts (AccountId stays NULL if
   no match); emergency requests get Type/Priority 'Emergency', urgent requests
   are a 'Leak Call' at 'High' priority, everything else is a 'Leak Call' at
   'Standard' priority. */
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
  const company      = clean(body.company, 200);
  const name         = clean(body.name, 200);
  const phone        = clean(body.phone, 30);
  const email        = clean(body.email, 200);
  const building     = clean(body.building, 200);
  const leakLocation = clean(body.leakLocation, 200);
  const problem      = clean(body.problem, 4000);
  const emergency    = !!body.emergency;
  const urgent       = !!body.urgent;

  // ---- Validation ------------------------------------------------------
  if (!name && !phone && !email) {
    context.res = { status: 400,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: { ok: false, error: "name, phone, or email required" } };
    return;
  }

  const type     = emergency ? "Emergency" : "Leak Call";
  const priority = emergency ? "Emergency" : urgent ? "High" : "Standard";

  // Full problem text carries the reporter's contact details.
  const problemText = problem +
    "\n\nReported by: " + name + " · " + phone + " · " + email +
    (building ? "\nBuilding: " + building : "");

  try {
    const p = await getPool();

    // ---- Fuzzy account match on company name (parameterized LIKE) ------
    let accountId = null;
    if (company) {
      const match = await p.request()
        .input("companyPattern", sql.NVarChar(210), "%" + company + "%")
        .query("SELECT TOP 1 Id FROM dbo.Accounts WHERE Name LIKE @companyPattern");
      if (match.recordset && match.recordset[0]) accountId = match.recordset[0].Id;
    }

    // ---- Parameterized INSERT (Status/Priority defaults overridden) ----
    const result = await p.request()
      .input("accountId", sql.Int, accountId)
      .input("type", sql.NVarChar(30), type)
      .input("priority", sql.NVarChar(12), priority)
      .input("problem", sql.NVarChar(sql.MAX), problemText)
      .input("leakLocation", sql.NVarChar(200), leakLocation)
      .query(`
        INSERT INTO dbo.WorkOrders (AccountId, Type, Priority, Problem, LeakLocation)
        OUTPUT INSERTED.Id AS id
        VALUES (@accountId, @type, @priority, @problem, @leakLocation)`);

    const newId = result.recordset && result.recordset[0] ? result.recordset[0].id : null;

    // ---- Stamp the WO number now that the Id is known -------------------
    await p.request()
      .input("newId", sql.Int, newId)
      .query(`
        UPDATE dbo.WorkOrders
        SET Number = CONCAT(N'WO-', YEAR(SYSUTCDATETIME()), N'-', Id)
        WHERE Id = @newId`);

    const number = "WO-" + new Date().getUTCFullYear() + "-" + newId;
    context.res = { status: 201,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: { ok: true, id: newId, number: number } };
  } catch (e) {
    context.log.error("Service request insert error:", e.message);
    context.res = { status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: { ok: false, error: "Could not save request" } };
  }
};

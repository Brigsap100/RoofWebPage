/* Kodiak CRM REST API — GET /api/rest/{entity}
   Reads from Azure SQL and returns rows shaped exactly like the
   front-end's local dataset (crm/js/data.js), wrapped as { value: [...] }. */
const sql = require("mssql");

// Each entity maps to a SELECT that aliases DB columns to the JS field names.
const QUERIES = {
  accounts: `
    SELECT Id AS id, Name AS name, Type AS type, City AS city, State AS state,
           Contact AS contact, Title AS title, Phone AS phone, Email AS email,
           Owner AS owner
    FROM dbo.Accounts ORDER BY Id`,
  opportunities: `
    SELECT o.Id AS id, o.Name AS name, o.AccountId AS accountId, a.Name AS account,
           o.Stage AS stage, o.Service AS service, o.SystemType AS [system],
           CAST(o.Value AS FLOAT) AS value, o.Sqft AS sqft,
           CONVERT(varchar(10), o.CloseDate, 23) AS closeDate,
           o.Owner AS owner, CAST(o.Prob AS FLOAT) AS prob
    FROM dbo.Opportunities o JOIN dbo.Accounts a ON a.Id = o.AccountId
    ORDER BY o.Id`,
  projects: `
    SELECT Id AS id, Name AS name, AccountId AS accountId,
           CAST(Value AS FLOAT) AS value, Sqft AS sqft, SystemType AS [system],
           Status AS status, Pct AS pct, PM AS pm,
           CONVERT(varchar(10), StartDate, 23) AS [start],
           CONVERT(varchar(10), EndDate, 23) AS [end]
    FROM dbo.Projects ORDER BY Id`,
  estimates: `
    SELECT Id AS id, Number AS number, OpportunityId AS opportunityId,
           Account AS account, CAST(Amount AS FLOAT) AS amount, Status AS status,
           CONVERT(varchar(10), EstDate, 23) AS [date]
    FROM dbo.Estimates ORDER BY Id`,
  activities: `
    SELECT Id AS id, Type AS type, Subject AS subject, Account AS account,
           Owner AS owner, CONVERT(varchar(10), DueDate, 23) AS due,
           CAST(Done AS INT) AS done
    FROM dbo.Activities ORDER BY Id`,
  leads: `
    SELECT Id AS id, Source AS source, Name AS name, Company AS company,
           Email AS email, Phone AS phone, Service AS service,
           Position AS position, Message AS message, Status AS status,
           CONVERT(varchar(10), CreatedDate, 23) AS createdDate, Owner AS owner
    FROM dbo.Leads ORDER BY Id DESC`
};

let pool; // reused across warm invocations
async function getPool() {
  if (pool && pool.connected) return pool;
  pool = await sql.connect(process.env.DATABASE_CONNECTION_STRING);
  return pool;
}

module.exports = async function (context, req) {
  const entity = String(req.params.entity || "").toLowerCase();
  const query = QUERIES[entity];
  if (!query) {
    context.res = { status: 404, headers: { "Content-Type": "application/json" },
      body: { error: "Unknown entity", entities: Object.keys(QUERIES) } };
    return;
  }
  try {
    const p = await getPool();
    const result = await p.request().query(query);
    const rows = result.recordset.map(r => {
      if ("done" in r) r.done = !!r.done; // bit → boolean
      return r;
    });
    context.res = { status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: { value: rows, source: "azure-sql" } };
  } catch (e) {
    context.log.error("SQL error:", e.message);
    context.res = { status: 500, headers: { "Content-Type": "application/json" },
      body: { error: "Database unavailable" } };
  }
};

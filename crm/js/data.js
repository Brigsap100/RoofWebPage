/* ============================================================
   Kodiak CRM — shared data layer
   Rich dummy data for demo + a data-access API that uses the
   live Data API Builder (Azure SQL) endpoint when available,
   otherwise falls back to this in-memory dataset.
   ============================================================ */
window.KODIAK_CRM = (function () {

  // ---- Reference data -------------------------------------------------
  const STAGES = [
    { key: "lead",        label: "Lead",           prob: 0.10 },
    { key: "inspection",  label: "Site Inspection",prob: 0.25 },
    { key: "estimating",  label: "Estimating",     prob: 0.45 },
    { key: "bid",         label: "Bid Submitted",  prob: 0.65 },
    { key: "negotiation", label: "Negotiation",    prob: 0.80 },
    { key: "won",         label: "Won",            prob: 1.00 },
    { key: "lost",        label: "Lost",           prob: 0.00 }
  ];
  const SERVICES = ["Commercial Re-Roofing","Commercial Waterproofing","Metal Roofing & Panels",
    "Roof Life Extension","Preventative Maintenance","24/7 Emergency Leak Repair","Waterproofing Injections"];
  const SYSTEMS = ["TPO Single-Ply","PVC Single-Ply","Built-Up (BUR)","Modified Bitumen","Standing-Seam Metal","EPDM"];

  // ---- Accounts (property owners / GCs / facility managers) ----------
  const accounts = [
    { id:1,  name:"Google (Bay View Campus)",       type:"Owner",             city:"Mountain View", state:"CA", contact:"Dana Reyes",     title:"Facilities Director",  phone:"650-555-0142", email:"dreyes@example.com",  owner:"Marcus Hale" },
    { id:2,  name:"Sacramento Kings — Golden 1",     type:"Owner",             city:"Sacramento",    state:"CA", contact:"Priya Shah",     title:"VP Operations",        phone:"916-555-0110", email:"pshah@example.com",   owner:"Marcus Hale" },
    { id:3,  name:"Carson Tahoe Health",             type:"Owner",             city:"Carson City",   state:"NV", contact:"Dave Lamb",      title:"Facilities Manager",   phone:"775-555-0199", email:"dlamb@example.com",   owner:"Elena Ortiz" },
    { id:4,  name:"Enso Village",                    type:"Property Manager",  city:"Healdsburg",    state:"CA", contact:"James Averill",  title:"Assistant PM",         phone:"707-555-0163", email:"javerill@example.com",owner:"Elena Ortiz" },
    { id:5,  name:"Midway Commerce Center",          type:"Owner",             city:"Vacaville",     state:"CA", contact:"Karen Wu",       title:"Asset Manager",        phone:"707-555-0177", email:"kwu@example.com",     owner:"Marcus Hale" },
    { id:6,  name:"Turner Construction",             type:"General Contractor",city:"Sacramento",    state:"CA", contact:"Rob Mitchell",   title:"Senior PM",            phone:"916-555-0128", email:"rmitchell@example.com",owner:"Sofia Nguyen" },
    { id:7,  name:"Reno Logistics Park",             type:"Owner",             city:"Reno",          state:"NV", contact:"Alan Pierce",    title:"Operations Lead",      phone:"775-555-0121", email:"apierce@example.com", owner:"Elena Ortiz" },
    { id:8,  name:"Delta Cold Storage",              type:"Owner",             city:"Stockton",      state:"CA", contact:"Maria Gomez",    title:"Plant Manager",        phone:"209-555-0155", email:"mgomez@example.com",  owner:"Sofia Nguyen" },
    { id:9,  name:"Foothill School District",        type:"Owner",             city:"Roseville",     state:"CA", contact:"Tom Barnes",     title:"Facilities Supervisor",phone:"916-555-0184", email:"tbarnes@example.com", owner:"Marcus Hale" },
    { id:10, name:"Sierra Medical Plaza",            type:"Property Manager",  city:"Reno",          state:"NV", contact:"Nina Patel",     title:"Property Manager",     phone:"775-555-0137", email:"npatel@example.com",  owner:"Elena Ortiz" },
    { id:11, name:"BayFront Tech Center",            type:"Owner",             city:"Fremont",       state:"CA", contact:"Greg Olson",     title:"Facilities Director",  phone:"510-555-0146", email:"golson@example.com",  owner:"Sofia Nguyen" },
    { id:12, name:"Hexcel Manufacturing",            type:"Owner",             city:"West Sacramento",state:"CA",contact:"Lena Ford",      title:"EHS Manager",          phone:"916-555-0173", email:"lford@example.com",   owner:"Marcus Hale" }
  ];

  const reps = ["Marcus Hale","Elena Ortiz","Sofia Nguyen"];

  // ---- Opportunities (pipeline) --------------------------------------
  // value in USD, sqft roof area
  const rawOpps = [
    ["Bay View Roof Restoration",1,"estimating","Commercial Re-Roofing","TPO Single-Ply",1850000,240000,"2026-09-15"],
    ["Golden 1 Arena Re-Roof",2,"negotiation","Commercial Re-Roofing","PVC Single-Ply",2650000,180000,"2026-08-30"],
    ["Carson Tahoe Waterproofing",3,"won","Commercial Waterproofing","Modified Bitumen",720000,60000,"2026-06-01"],
    ["Enso Village Maintenance Program",4,"bid","Preventative Maintenance","EPDM",180000,90000,"2026-08-10"],
    ["Midway Metal Roof Install",5,"inspection","Metal Roofing & Panels","Standing-Seam Metal",1250000,150000,"2026-10-05"],
    ["Turner — Downtown Tower Roof",6,"estimating","Commercial Re-Roofing","TPO Single-Ply",3100000,210000,"2026-11-01"],
    ["Reno Logistics Warehouse Re-Roof",7,"lead","Commercial Re-Roofing","TPO Single-Ply",980000,320000,"2026-12-01"],
    ["Delta Cold Storage Leak Repair",8,"won","24/7 Emergency Leak Repair","Built-Up (BUR)",145000,40000,"2026-05-20"],
    ["Foothill District Roof Survey",9,"inspection","Preventative Maintenance","Modified Bitumen",95000,120000,"2026-09-01"],
    ["Sierra Medical Plaza Restoration",10,"bid","Roof Life Extension","TPO Single-Ply",560000,72000,"2026-08-25"],
    ["BayFront Tech Waterproofing",11,"estimating","Commercial Waterproofing","PVC Single-Ply",640000,54000,"2026-10-15"],
    ["Hexcel Plant Emergency Repair",12,"won","24/7 Emergency Leak Repair","Metal Roofing & Panels",210000,30000,"2026-04-18"],
    ["Reno Logistics — Building B",7,"lead","Metal Roofing & Panels","Standing-Seam Metal",1450000,260000,"2027-01-10"],
    ["Google Annex Waterproofing",1,"bid","Waterproofing Injections","Modified Bitumen",340000,18000,"2026-09-05"],
    ["Foothill HS Gym Re-Roof",9,"lost","Commercial Re-Roofing","Built-Up (BUR)",480000,45000,"2026-05-01"],
    ["Delta Cold Storage Expansion Roof",8,"estimating","Commercial Roofing","EPDM",890000,110000,"2026-11-20"],
    ["Sierra Medical HVAC Deck Seal",10,"negotiation","Commercial Waterproofing","PVC Single-Ply",275000,22000,"2026-08-18"],
    ["Turner — Parking Structure Deck",6,"lead","Commercial Waterproofing","Modified Bitumen",520000,88000,"2026-12-15"],
    ["BayFront Roof Life Extension",11,"won","Roof Life Extension","TPO Single-Ply",430000,64000,"2026-03-30"],
    ["Midway Warehouse 3 Re-Roof",5,"bid","Commercial Re-Roofing","TPO Single-Ply",1120000,170000,"2026-10-28"]
  ];
  const opportunities = rawOpps.map((o,i) => {
    const acct = accounts.find(a=>a.id===o[1]);
    return { id:i+1, name:o[0], accountId:o[1], account:acct.name, stage:o[2], service:o[3], system:o[4],
      value:o[5], sqft:o[6], closeDate:o[7], owner:acct.owner,
      prob: STAGES.find(s=>s.key===o[2]).prob };
  });

  // ---- Projects (won jobs in delivery) --------------------------------
  const projects = [
    { id:1, name:"Carson Tahoe Waterproofing", accountId:3, value:720000, sqft:60000, system:"Modified Bitumen", status:"In Progress", pct:65, pm:"Elena Ortiz", start:"2026-06-10", end:"2026-09-30" },
    { id:2, name:"Delta Cold Storage Leak Repair", accountId:8, value:145000, sqft:40000, system:"Built-Up (BUR)", status:"Complete", pct:100, pm:"Sofia Nguyen", start:"2026-05-22", end:"2026-06-15" },
    { id:3, name:"Hexcel Plant Emergency Repair", accountId:12, value:210000, sqft:30000, system:"Metal Roofing & Panels", status:"Complete", pct:100, pm:"Marcus Hale", start:"2026-04-19", end:"2026-05-10" },
    { id:4, name:"BayFront Roof Life Extension", accountId:11, value:430000, sqft:64000, system:"TPO Single-Ply", status:"In Progress", pct:40, pm:"Sofia Nguyen", start:"2026-04-05", end:"2026-08-15" },
    { id:5, name:"Sierra Medical HVAC Deck Seal", accountId:10, value:275000, sqft:22000, system:"PVC Single-Ply", status:"Scheduled", pct:5, pm:"Elena Ortiz", start:"2026-09-01", end:"2026-10-20" }
  ];

  // ---- Estimates ------------------------------------------------------
  const estimates = [
    { id:1, number:"EST-2026-041", opportunityId:1, account:"Google (Bay View Campus)", amount:1850000, status:"Draft",    date:"2026-07-12" },
    { id:2, number:"EST-2026-039", opportunityId:2, account:"Sacramento Kings — Golden 1", amount:2650000, status:"Sent",  date:"2026-07-05" },
    { id:3, number:"EST-2026-036", opportunityId:4, account:"Enso Village", amount:180000, status:"Sent",       date:"2026-06-28" },
    { id:4, number:"EST-2026-044", opportunityId:10,account:"Sierra Medical Plaza", amount:560000, status:"Sent",  date:"2026-07-15" },
    { id:5, number:"EST-2026-030", opportunityId:3, account:"Carson Tahoe Health", amount:720000, status:"Accepted", date:"2026-05-25" },
    { id:6, number:"EST-2026-046", opportunityId:14,account:"Google (Bay View Campus)", amount:340000, status:"Sent", date:"2026-07-18" },
    { id:7, number:"EST-2026-028", opportunityId:15,account:"Foothill School District", amount:480000, status:"Rejected", date:"2026-04-22" }
  ];

  // ---- Activities -----------------------------------------------------
  const activities = [
    { id:1, type:"Site Visit",   subject:"Roof inspection — Bay View", account:"Google (Bay View Campus)", owner:"Marcus Hale", due:"2026-07-24", done:false },
    { id:2, type:"Call",         subject:"Follow up on Golden 1 bid", account:"Sacramento Kings — Golden 1", owner:"Marcus Hale", due:"2026-07-22", done:false },
    { id:3, type:"Email",        subject:"Send maintenance proposal", account:"Enso Village", owner:"Elena Ortiz", due:"2026-07-23", done:false },
    { id:4, type:"Meeting",      subject:"Kickoff — Carson Tahoe", account:"Carson Tahoe Health", owner:"Elena Ortiz", due:"2026-07-21", done:true },
    { id:5, type:"Site Visit",   subject:"Measure Midway warehouse", account:"Midway Commerce Center", owner:"Marcus Hale", due:"2026-07-28", done:false },
    { id:6, type:"Call",         subject:"Reno logistics intro call", account:"Reno Logistics Park", owner:"Elena Ortiz", due:"2026-07-25", done:false },
    { id:7, type:"Email",        subject:"Estimate revision — Sierra", account:"Sierra Medical Plaza", owner:"Elena Ortiz", due:"2026-07-26", done:false },
    { id:8, type:"Meeting",      subject:"Turner PM sync", account:"Turner Construction", owner:"Sofia Nguyen", due:"2026-07-29", done:false }
  ];

  // ---- Leads (inbound from the public website) -----------------------
  // Shape matches the shared lead-intake contract (POST /api/lead →
  // GET /api/rest/leads). website-contact leads carry a `service`;
  // careers-application leads carry a `position`.
  const leads = [
    { id:1, source:"website-contact",     name:"Brenda Cole",   company:"Northgate Retail Group", email:"bcole@example.com",    phone:"916-555-0212", service:"Commercial Re-Roofing",       position:"",                            message:"Two of our strip-mall roofs are ponding badly after the last storm. We need an assessment and a re-roof quote for roughly 85,000 sq ft across three buildings.", status:"new",       createdDate:"2026-07-20", owner:"Marcus Hale" },
    { id:2, source:"website-contact",     name:"Victor Ramirez",company:"Delta Cold Storage",     email:"vramirez@example.com", phone:"209-555-0188", service:"24/7 Emergency Leak Repair",  position:"",                            message:"Active leak over freezer bay 3 — water is dripping onto stored product. Need emergency service as soon as possible.",                                        status:"contacted", createdDate:"2026-07-19", owner:"Sofia Nguyen" },
    { id:3, source:"careers-application", name:"Tyler Nguyen",  company:"",                       email:"tnguyen@example.com",  phone:"916-555-0233", service:"",                            position:"Commercial Roofing Foreman", message:"8 years of TPO and PVC single-ply experience, OSHA 30 certified. Looking to lead crews in the Sacramento area.",                                             status:"new",       createdDate:"2026-07-18", owner:"Elena Ortiz" },
    { id:4, source:"website-contact",     name:"Angela Foster", company:"Foothill School District", email:"afoster@example.com", phone:"916-555-0245", service:"Preventative Maintenance",   position:"",                            message:"Interested in an annual preventative-maintenance program across six campus buildings before the new school year starts.",                                     status:"converted", createdDate:"2026-07-15", owner:"Marcus Hale" },
    { id:5, source:"careers-application", name:"Marcus Webb",   company:"",                       email:"mwebb@example.com",    phone:"775-555-0261", service:"",                            position:"Commercial Estimator",       message:"5 years of commercial roofing estimating, proficient with EagleView and On-Screen Takeoff. Open to hybrid or on-site in Reno.",                              status:"contacted", createdDate:"2026-07-14", owner:"Elena Ortiz" },
    { id:6, source:"website-contact",     name:"Priya Menon",   company:"BayFront Tech Center",   email:"pmenon@example.com",   phone:"510-555-0279", service:"Commercial Waterproofing",    position:"",                            message:"The plaza deck above our parking structure is leaking into the lobby. Requesting a waterproofing evaluation and repair estimate.",                            status:"archived",  createdDate:"2026-07-11", owner:"Sofia Nguyen" }
  ];

  // ---- Helpers / derived metrics -------------------------------------
  const fmt = (n) => "$" + Number(n).toLocaleString("en-US");
  const fmtShort = (n) => n>=1e6 ? "$"+(n/1e6).toFixed(1)+"M" : n>=1e3 ? "$"+Math.round(n/1e3)+"K" : "$"+n;

  function metrics() {
    const open = opportunities.filter(o=>o.stage!=="won"&&o.stage!=="lost");
    const won = opportunities.filter(o=>o.stage==="won");
    const lost = opportunities.filter(o=>o.stage==="lost");
    const pipelineValue = open.reduce((s,o)=>s+o.value,0);
    const weighted = open.reduce((s,o)=>s+o.value*o.prob,0);
    const wonValue = won.reduce((s,o)=>s+o.value,0);
    const winRate = (won.length+lost.length) ? Math.round(won.length/(won.length+lost.length)*100) : 0;
    return { openCount:open.length, pipelineValue, weighted, wonValue, winRate,
             totalSqft: open.reduce((s,o)=>s+o.sqft,0) };
  }
  function byStage() {
    return STAGES.filter(s=>s.key!=="won"&&s.key!=="lost").map(s => ({
      ...s, opps: opportunities.filter(o=>o.stage===s.key),
      value: opportunities.filter(o=>o.stage===s.key).reduce((a,o)=>a+o.value,0)
    }));
  }

  // ---- Live API (Azure SQL via Azure Functions) with fallback --------
  // The Settings page can override these via localStorage:
  //   kodiakCrmApiBase  → base URL for the REST endpoint (default "/api/rest")
  //   kodiakCrmDataMode → "auto" (default) | "live" | "demo"
  const DEFAULT_API_BASE = "/api/rest";
  function lsGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  let dataMode = "auto";
  const savedMode = lsGet("kodiakCrmDataMode");
  if (savedMode === "auto" || savedMode === "live" || savedMode === "demo") dataMode = savedMode;

  let API_BASE = DEFAULT_API_BASE;
  const savedBase = lsGet("kodiakCrmApiBase");
  // Strip whitespace and trailing slashes so "/api/rest/" doesn't become "/api/rest//accounts".
  if (savedBase && savedBase.trim()) API_BASE = savedBase.trim().replace(/\/+$/, "") || DEFAULT_API_BASE;

  async function apiGet(entity) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const r = await fetch(API_BASE + "/" + entity, { headers:{ "Accept":"application/json" }, signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error("api " + r.status);
      const j = await r.json();
      return j.value || j;
    } catch (e) { return null; } // fall back to local dataset
  }

  // Replace an array's contents in place so existing references stay valid.
  // Live rows win when the call returned an array (even empty); a failed
  // call (null) clears the demo rows — live data must never mix with demo.
  function swap(arr, rows) {
    if (Array.isArray(rows)) arr.splice(0, arr.length, ...rows);
    else arr.length = 0;
  }
  function emptyAll() {
    [accounts, opportunities, projects, estimates, activities, leads]
      .forEach((arr) => { arr.length = 0; });
  }

  let dataSource = "Demo data (local)";
  // `ready` resolves once live data has been loaded (or the fallback kept).
  const ready = (async () => {
    if (dataMode === "demo") {                 // forced offline: never call the API
      dataSource = "Demo data (forced)";
      return dataSource;
    }
    const [acc, opp, prj, est, act, lds] = await Promise.all([
      apiGet("accounts"), apiGet("opportunities"), apiGet("projects"),
      apiGet("estimates"), apiGet("activities"), apiGet("leads")
    ]);
    if (acc && opp) {
      swap(accounts, acc); swap(opportunities, opp);
      swap(projects, prj); swap(estimates, est); swap(activities, act);
      swap(leads, lds);
      dataSource = "Azure SQL (live)";
    } else if (dataMode === "live") {          // live only: never show demo rows
      emptyAll();
      dataSource = "Live mode — backend unreachable";
    }
    return dataSource;
  })();

  return {
    STAGES, SERVICES, SYSTEMS, reps,
    accounts, opportunities, projects, estimates, activities, leads,
    fmt, fmtShort, metrics, byStage, apiGet, API_BASE, ready,
    get source() { return dataSource; },
    get dataMode() { return dataMode; },
    account: (id) => accounts.find(a=>a.id===id)
  };
})();

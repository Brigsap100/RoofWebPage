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

  // ---- Service department reference data ------------------------------
  const WO_TYPES = ["Leak Call","Repair","Preventative Maintenance","Inspection","Emergency","Warranty Claim"];
  const WO_STATUSES = ["new","scheduled","dispatched","in-progress","on-hold","completed","invoiced","closed","cancelled"];
  const WO_PRIORITIES = [
    { key:"Emergency", slaHours:4 },
    { key:"High",      slaHours:24 },
    { key:"Standard",  slaHours:72 },
    { key:"Low",       slaHours:168 }
  ];
  const TECHS = [
    { name:"Ray Delgado",   role:"Lead Service Tech", certs:["OSHA 30","GAF Certified"] },
    { name:"Jimmy Park",    role:"Service Tech",      certs:["OSHA 10","Carlisle TPO"] },
    { name:"Colleen Reyes", role:"Service Tech",      certs:["OSHA 10","Sika Sarnafil"] },
    { name:"Omar Sissoko",  role:"Apprentice",        certs:["OSHA 10"] }
  ];
  // Open (not-yet-billed/terminal) work-order statuses.
  const WO_OPEN = ["new","scheduled","dispatched","in-progress","on-hold"];

  // ---- Roof assets (sections under service management) ----------------
  // condition: 1 (failing) … 5 (excellent). remainingLife in years.
  const roofAssets = [
    { id:1,  accountId:1,  account:"Google (Bay View Campus)",    building:"Bay View Building 1",          address:"1100 Shoreline Blvd, Mountain View, CA",   section:"Section A — Main Roof",     system:"TPO Single-Ply",      sqft:140000, installYear:2021, condition:4, remainingLife:15, warrantyType:"Manufacturer NDL 20-yr", warrantyExpiry:"2041-05-15", accessNotes:"Badge escort required; roof hatch at NE stairwell" },
    { id:2,  accountId:1,  account:"Google (Bay View Campus)",    building:"Bay View Building 1",          address:"1100 Shoreline Blvd, Mountain View, CA",   section:"Section B — Annex Roof",    system:"Modified Bitumen",    sqft:18000,  installYear:2012, condition:2, remainingLife:3,  warrantyType:"None",                   warrantyExpiry:null,         accessNotes:"Ladder access only, west wall; 24-hr notice for escort" },
    { id:3,  accountId:2,  account:"Sacramento Kings — Golden 1", building:"Golden 1 Center",              address:"500 David J Stern Walk, Sacramento, CA",   section:"Main Arena Roof",           system:"PVC Single-Ply",      sqft:180000, installYear:2016, condition:3, remainingLife:8,  warrantyType:"Manufacturer NDL 20-yr", warrantyExpiry:"2036-09-30", accessNotes:"Coordinate with arena ops — no access on event days" },
    { id:4,  accountId:3,  account:"Carson Tahoe Health",         building:"Regional Medical Center",      address:"1600 Medical Pkwy, Carson City, NV",       section:"Tower Roof — East Wing",    system:"Modified Bitumen",    sqft:60000,  installYear:2010, condition:2, remainingLife:2,  warrantyType:"Workmanship 5-yr",       warrantyExpiry:"2026-11-30", accessNotes:"Infection-control protocol; check in at security desk" },
    { id:5,  accountId:5,  account:"Midway Commerce Center",      building:"Warehouse 3",                  address:"2800 Boyd Dr, Vacaville, CA",              section:"Full Roof",                 system:"Built-Up (BUR)",      sqft:170000, installYear:2004, condition:3, remainingLife:5,  warrantyType:"None",                   warrantyExpiry:null,         accessNotes:"Roof hatch key in dock office; forklift traffic below" },
    { id:6,  accountId:7,  account:"Reno Logistics Park",         building:"Building A",                   address:"9550 N Virginia St, Reno, NV",             section:"Full Roof",                 system:"TPO Single-Ply",      sqft:320000, installYear:2018, condition:4, remainingLife:14, warrantyType:"Manufacturer NDL 20-yr", warrantyExpiry:"2038-04-01", accessNotes:"Gate code 4471; interior ladder at column G-2" },
    { id:7,  accountId:7,  account:"Reno Logistics Park",         building:"Building B",                   address:"9600 N Virginia St, Reno, NV",             section:"Full Roof",                 system:"Standing-Seam Metal", sqft:260000, installYear:1998, condition:3, remainingLife:10, warrantyType:"None",                   warrantyExpiry:null,         accessNotes:"Steep pitch at south slope — fall protection required" },
    { id:8,  accountId:8,  account:"Delta Cold Storage",          building:"Freezer Warehouse",            address:"4400 Navone Rd, Stockton, CA",             section:"Freezer Bay Roof",          system:"Built-Up (BUR)",      sqft:40000,  installYear:2008, condition:2, remainingLife:2,  warrantyType:"Workmanship 5-yr",       warrantyExpiry:"2027-03-15", accessNotes:"Do not block refrigeration exhausts; plant escort required" },
    { id:9,  accountId:9,  account:"Foothill School District",    building:"Roseville High School — Gym",  address:"1 Tiger Way, Roseville, CA",               section:"Gym Roof",                  system:"Built-Up (BUR)",      sqft:45000,  installYear:2001, condition:3, remainingLife:4,  warrantyType:"None",                   warrantyExpiry:null,         accessNotes:"Work outside school hours; check in at front office" },
    { id:10, accountId:9,  account:"Foothill School District",    building:"District Office",              address:"1050 Main St, Roseville, CA",              section:"Full Roof",                 system:"Modified Bitumen",    sqft:22000,  installYear:2015, condition:4, remainingLife:9,  warrantyType:"Workmanship 5-yr",       warrantyExpiry:"2020-08-01", accessNotes:"Exterior ladder access, rear parking lot" },
    { id:11, accountId:10, account:"Sierra Medical Plaza",        building:"Medical Plaza Tower",          address:"343 Kirman Ave, Reno, NV",                 section:"HVAC Deck",                 system:"PVC Single-Ply",      sqft:22000,  installYear:2019, condition:3, remainingLife:10, warrantyType:"Manufacturer NDL 20-yr", warrantyExpiry:"2039-06-01", accessNotes:"Roof access via mechanical penthouse; PM approval needed" },
    { id:12, accountId:11, account:"BayFront Tech Center",        building:"Tech Center Building 2",       address:"48000 Fremont Blvd, Fremont, CA",          section:"Full Roof",                 system:"TPO Single-Ply",      sqft:64000,  installYear:2013, condition:3, remainingLife:6,  warrantyType:"Manufacturer NDL 20-yr", warrantyExpiry:"2033-08-15", accessNotes:"Badge at lobby; hatch alarm — call facilities before opening" },
    { id:13, accountId:12, account:"Hexcel Manufacturing",        building:"Plant 1 — Production",         address:"6700 W Capitol Ave, West Sacramento, CA",  section:"Production Hall Roof",      system:"Standing-Seam Metal", sqft:30000,  installYear:1995, condition:3, remainingLife:7,  warrantyType:"None",                   warrantyExpiry:null,         accessNotes:"EHS orientation required; hot-work permit for any welding" }
  ];

  // ---- Work orders -----------------------------------------------------
  // The two open emergency-priority calls get live timestamps so SLA clocks
  // are meaningful in the demo: one ~2h old (inside the 4h SLA), one ~6h
  // old (blown SLA). Everything else uses fixed July-2026 datetimes.
  const hoursAgoIso = (h) => new Date(Date.now() - h * 3600e3).toISOString().slice(0, 19);
  const workOrders = [
    { id:101, number:"WO-2026-101", accountId:5,  account:"Midway Commerce Center",      roofAssetId:5,  contractId:null, type:"Leak Call",                priority:"High",      status:"new",         problem:"Water dripping through deck near dock doors after overnight rain", leakLocation:"NW corner, dock doors 4-6",              reportedAt:"2026-07-21T08:15:00", scheduledDate:null,         completedAt:null,                 tech:null,            nte:5000,  po:"MCC-2210", resolution:null, photosBefore:2, photosAfter:0, deficiencies:null, invoiceAmount:null },
    { id:102, number:"WO-2026-102", accountId:9,  account:"Foothill School District",    roofAssetId:9,  contractId:null, type:"Repair",                   priority:"Standard",  status:"new",         problem:"Cracked BUR flashing along gym east parapet — reported by custodian", leakLocation:null,                                  reportedAt:"2026-07-20T14:30:00", scheduledDate:null,         completedAt:null,                 tech:null,            nte:7500,  po:"FSD-4482", resolution:null, photosBefore:3, photosAfter:0, deficiencies:null, invoiceAmount:null },
    { id:103, number:"WO-2026-103", accountId:4,  account:"Enso Village",                roofAssetId:null,contractId:4,   type:"Preventative Maintenance", priority:"Low",       status:"scheduled",   problem:"Q3 contract PM visit — drains, seams, penetrations, walk pads",     leakLocation:null,                                  reportedAt:"2026-07-14T09:00:00", scheduledDate:"2026-07-30", completedAt:null,                 tech:"Omar Sissoko",  nte:null,  po:null,       resolution:null, photosBefore:0, photosAfter:0, deficiencies:null, invoiceAmount:null },
    { id:104, number:"WO-2026-104", accountId:2,  account:"Sacramento Kings — Golden 1", roofAssetId:3,  contractId:null, type:"Inspection",               priority:"Standard",  status:"in-progress", problem:"Pre-season condition survey of main arena roof ahead of event calendar", leakLocation:null,                               reportedAt:"2026-07-18T09:00:00", scheduledDate:"2026-07-22", completedAt:null,                 tech:"Ray Delgado",   nte:4500,  po:"G1C-2291", resolution:null, photosBefore:6, photosAfter:0, deficiencies:3,   invoiceAmount:null },
    { id:105, number:"WO-2026-105", accountId:8,  account:"Delta Cold Storage",          roofAssetId:8,  contractId:null, type:"Leak Call",                priority:"Emergency", status:"dispatched",  problem:"Active leak over freezer bay 3 — water dripping onto stored product", leakLocation:"Freezer bay 3, above racking row C",  reportedAt:hoursAgoIso(6),        scheduledDate:"2026-07-22", completedAt:null,                 tech:"Jimmy Park",    nte:10000, po:"DCS-7731", resolution:null, photosBefore:1, photosAfter:0, deficiencies:null, invoiceAmount:null },
    { id:106, number:"WO-2026-106", accountId:12, account:"Hexcel Manufacturing",        roofAssetId:13, contractId:null, type:"Emergency",                priority:"Emergency", status:"in-progress", problem:"Wind-lifted ridge panels — active water intrusion into production hall", leakLocation:"Production hall, column grid E-7", reportedAt:hoursAgoIso(2),        scheduledDate:"2026-07-22", completedAt:null,                 tech:"Ray Delgado",   nte:15000, po:"HEX-5520", resolution:null, photosBefore:4, photosAfter:0, deficiencies:null, invoiceAmount:null },
    { id:107, number:"WO-2026-107", accountId:10, account:"Sierra Medical Plaza",        roofAssetId:11, contractId:null, type:"Repair",                   priority:"High",      status:"scheduled",   problem:"Permanent membrane repair at HVAC deck penetration (follow-up to temp fix on WO-2026-111)", leakLocation:null,             reportedAt:"2026-07-11T09:30:00", scheduledDate:"2026-07-28", completedAt:null,                 tech:"Colleen Reyes", nte:8500,  po:"SMP-1180", resolution:null, photosBefore:5, photosAfter:0, deficiencies:null, invoiceAmount:null },
    { id:108, number:"WO-2026-108", accountId:3,  account:"Carson Tahoe Health",         roofAssetId:4,  contractId:2,   type:"Preventative Maintenance", priority:"Standard",  status:"in-progress", problem:"July contract PM visit — east wing tower; clear drains, inspect flashings", leakLocation:null,                            reportedAt:"2026-07-15T08:00:00", scheduledDate:"2026-07-21", completedAt:null,                 tech:"Jimmy Park",    nte:null,  po:null,       resolution:null, photosBefore:2, photosAfter:0, deficiencies:null, invoiceAmount:null },
    { id:109, number:"WO-2026-109", accountId:7,  account:"Reno Logistics Park",         roofAssetId:7,  contractId:null, type:"Repair",                   priority:"Standard",  status:"on-hold",     problem:"Replace wind-damaged standing-seam panels at Building B ridge — on hold pending panel delivery (ETA 08/04)", leakLocation:null, reportedAt:"2026-07-09T10:45:00", scheduledDate:"2026-08-06", completedAt:null,             tech:"Colleen Reyes", nte:12000, po:"RLP-3327", resolution:null, photosBefore:7, photosAfter:0, deficiencies:null, invoiceAmount:null },
    { id:110, number:"WO-2026-110", accountId:11, account:"BayFront Tech Center",        roofAssetId:12, contractId:null, type:"Emergency",                priority:"Emergency", status:"completed",   problem:"Water pouring into server room ceiling during storm",                leakLocation:"Roof section above server room, HVAC curb 2", reportedAt:"2026-07-08T06:40:00", scheduledDate:"2026-07-08", completedAt:"2026-07-08T09:55:00", tech:"Ray Delgado",   nte:7500,  po:"BFT-0917", resolution:"Located split seam at HVAC curb 2; heat-welded 6-ft TPO patch and resealed curb flashing. Leak stopped on site.", photosBefore:4, photosAfter:3, deficiencies:null, invoiceAmount:3850 },
    { id:111, number:"WO-2026-111", accountId:10, account:"Sierra Medical Plaza",        roofAssetId:11, contractId:null, type:"Leak Call",                priority:"High",      status:"completed",   problem:"Leak at HVAC deck penetration staining 4th-floor exam room ceiling", leakLocation:"HVAC deck, SE penetration cluster",     reportedAt:"2026-07-10T11:20:00", scheduledDate:"2026-07-10", completedAt:"2026-07-10T16:05:00", tech:"Colleen Reyes", nte:2500,  po:"SMP-1174", resolution:"Temporary repair — mastic and reinforced membrane patch at deck penetration. Permanent repair scheduled under WO-2026-107.", photosBefore:3, photosAfter:2, deficiencies:null, invoiceAmount:1450 },
    { id:112, number:"WO-2026-112", accountId:1,  account:"Google (Bay View Campus)",    roofAssetId:1,  contractId:1,   type:"Preventative Maintenance", priority:"Standard",  status:"completed",   problem:"July contract PM visit — Section A main roof",                       leakLocation:null,                                  reportedAt:"2026-07-01T08:00:00", scheduledDate:"2026-07-06", completedAt:"2026-07-06T15:30:00", tech:"Omar Sissoko",  nte:null,  po:null,       resolution:"Monthly PM completed — cleared 14 drains, resealed two pitch pans, re-adhered loose walk pad at hatch.", photosBefore:2, photosAfter:2, deficiencies:null, invoiceAmount:800 },
    { id:113, number:"WO-2026-113", accountId:2,  account:"Sacramento Kings — Golden 1", roofAssetId:3,  contractId:null, type:"Leak Call",                priority:"High",      status:"invoiced",    problem:"Leak reported above concourse concession stand after June storm",    leakLocation:"Main arena roof, above NE concourse", reportedAt:"2026-06-24T13:10:00", scheduledDate:"2026-06-25", completedAt:"2026-06-25T10:45:00", tech:"Jimmy Park",    nte:5000,  po:"G1C-2255", resolution:"Traced leak to failed pitch pan at conduit cluster; rebuilt pitch pan and welded PVC target patch.", photosBefore:3, photosAfter:3, deficiencies:null, invoiceAmount:2650 },
    { id:114, number:"WO-2026-114", accountId:7,  account:"Reno Logistics Park",         roofAssetId:6,  contractId:null, type:"Inspection",               priority:"Standard",  status:"invoiced",    problem:"Annual condition survey — Building A full roof",                     leakLocation:null,                                  reportedAt:"2026-06-10T09:00:00", scheduledDate:"2026-06-16", completedAt:"2026-06-16T14:20:00", tech:"Ray Delgado",   nte:3500,  po:"RLP-3298", resolution:"Survey complete — 7 deficiencies documented (open seams, ponding at drain 6, damaged pipe boots). Repair estimate to follow.", photosBefore:12, photosAfter:0, deficiencies:7, invoiceAmount:3200 },
    { id:115, number:"WO-2026-115", accountId:3,  account:"Carson Tahoe Health",         roofAssetId:4,  contractId:null, type:"Warranty Claim",           priority:"Standard",  status:"closed",      problem:"Membrane blistering on east wing tower — filed under workmanship warranty", leakLocation:null,                           reportedAt:"2026-05-18T10:30:00", scheduledDate:"2026-05-26", completedAt:"2026-05-27T16:00:00", tech:"Jimmy Park",    nte:null,  po:null,       resolution:"Warranty claim approved; blistered area cut out and replaced at no charge under workmanship warranty.", photosBefore:5, photosAfter:4, deficiencies:null, invoiceAmount:0 },
    { id:116, number:"WO-2026-116", accountId:8,  account:"Delta Cold Storage",          roofAssetId:8,  contractId:7,   type:"Preventative Maintenance", priority:"Low",       status:"cancelled",   problem:"Semi-annual contract PM visit — freezer bay roof",                   leakLocation:null,                                  reportedAt:"2026-06-02T09:00:00", scheduledDate:"2026-06-20", completedAt:null,                 tech:null,            nte:null,  po:null,       resolution:"Cancelled — service contract SC-2026-07 expired 05/31 and was not renewed.", photosBefore:0, photosAfter:0, deficiencies:null, invoiceAmount:null }
  ];

  // ---- Service contracts ----------------------------------------------
  const contracts = [
    { id:1, number:"SC-2026-01", accountId:1,  account:"Google (Bay View Campus)", tier:"Platinum", billing:"Monthly",   annualValue:96000, start:"2026-01-01", end:"2026-12-31", visitsPerYear:12, visitsCompleted:6, nextVisitDue:"2026-08-05", status:"active" },
    { id:2, number:"SC-2026-02", accountId:3,  account:"Carson Tahoe Health",      tier:"Platinum", billing:"Monthly",   annualValue:84000, start:"2026-03-01", end:"2027-02-28", visitsPerYear:12, visitsCompleted:4, nextVisitDue:"2026-07-10", status:"active" },
    { id:3, number:"SC-2026-03", accountId:9,  account:"Foothill School District", tier:"Gold",     billing:"Quarterly", annualValue:36000, start:"2025-09-01", end:"2026-08-31", visitsPerYear:4,  visitsCompleted:3, nextVisitDue:"2026-08-15", status:"expiring" },
    { id:4, number:"SC-2026-04", accountId:4,  account:"Enso Village",             tier:"Gold",     billing:"Quarterly", annualValue:28000, start:"2026-02-01", end:"2027-01-31", visitsPerYear:4,  visitsCompleted:2, nextVisitDue:"2026-07-30", status:"active" },
    { id:5, number:"SC-2026-05", accountId:11, account:"BayFront Tech Center",     tier:"Gold",     billing:"Quarterly", annualValue:32000, start:"2026-04-01", end:"2027-03-31", visitsPerYear:4,  visitsCompleted:1, nextVisitDue:"2026-10-01", status:"active" },
    { id:6, number:"SC-2026-06", accountId:7,  account:"Reno Logistics Park",      tier:"Silver",   billing:"Annual",    annualValue:22000, start:"2026-05-01", end:"2027-04-30", visitsPerYear:2,  visitsCompleted:1, nextVisitDue:"2026-11-02", status:"active" },
    { id:7, number:"SC-2026-07", accountId:8,  account:"Delta Cold Storage",       tier:"Silver",   billing:"Annual",    annualValue:18000, start:"2025-06-01", end:"2026-05-31", visitsPerYear:2,  visitsCompleted:2, nextVisitDue:null,         status:"expired" }
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

  // ---- Service-department helpers -------------------------------------
  // All computed lazily on call — the arrays mutate in place on live swap.
  function serviceMetrics() {
    const open = workOrders.filter(w => WO_OPEN.includes(w.status));
    const active = contracts.filter(c => c.status === "active");
    const today = new Date().toISOString().slice(0, 10);
    return {
      openCount: open.length,
      emergencyCount: open.filter(w => w.priority === "Emergency").length,
      mrr: active.reduce((s, c) => s + c.annualValue / 12, 0),
      activeContracts: active.length,
      avgCondition: roofAssets.length
        ? roofAssets.reduce((s, r) => s + r.condition, 0) / roofAssets.length : 0,
      overdueVisits: contracts.filter(c =>
        c.status !== "expired" && c.nextVisitDue && c.nextVisitDue < today).length,
      invoicedTotal: workOrders
        .filter(w => (w.status === "invoiced" || w.status === "closed") && w.invoiceAmount != null)
        .reduce((s, w) => s + w.invoiceAmount, 0),
      sqftUnderManagement: roofAssets.reduce((s, r) => s + r.sqft, 0)
    };
  }
  function woByStatus() {
    return WO_STATUSES.map(s => ({ key: s, wos: workOrders.filter(w => w.status === s) }));
  }
  function techLoad() {
    return TECHS.map(t => ({
      ...t,
      active: workOrders.filter(w => w.tech === t.name && WO_OPEN.includes(w.status)).length
    }));
  }
  // Naive "YYYY-MM-DDTHH:MM:SS" datetimes are treated as UTC — the live
  // SLA clocks are generated from toISOString(), and for completed WOs
  // the elapsed diff is the same under any single convention.
  const parseWoDate = (s) =>
    new Date(/[Zz]|[+-]\d\d:?\d\d$/.test(s) ? s : s + "Z").getTime();
  function slaInfo(wo) {
    const pri = WO_PRIORITIES.find(p => p.key === wo.priority) || WO_PRIORITIES[2];
    const slaHours = pri.slaHours;
    const start = parseWoDate(wo.reportedAt);
    const end = wo.completedAt ? parseWoDate(wo.completedAt) : Date.now();
    const elapsedH = Math.max(0, (end - start) / 3600e3);
    const remainH = slaHours - elapsedH;
    return {
      slaHours, elapsedH, remainH,
      overdue: remainH < 0,
      pct: Math.min(100, Math.round(elapsedH / slaHours * 100))
    };
  }
  const roofAssetsFor = (accountId) => roofAssets.filter(r => r.accountId === accountId);
  const workOrdersFor = (accountId) => workOrders.filter(w => w.accountId === accountId);
  const roofAsset = (id) => roofAssets.find(r => r.id === id);
  const contract = (id) => contracts.find(c => c.id === id);

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
    [accounts, opportunities, projects, estimates, activities, leads,
     roofAssets, workOrders, contracts]
      .forEach((arr) => { arr.length = 0; });
  }

  // ---- Account-owner overrides (edited on the Accounts page) ---------
  // Stored in localStorage as { accountId: "Name" } so owner edits
  // survive reloads and also apply on top of live API rows.
  const OWNER_OVERRIDES_KEY = "kodiakCrmOwnerOverrides";
  function ownerOverrides() {
    try { return JSON.parse(lsGet(OWNER_OVERRIDES_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function applyOwnerOverrides() {
    const ov = ownerOverrides();
    accounts.forEach((a) => {
      const name = ov[a.id];
      if (typeof name === "string" && name.trim()) a.owner = name.trim();
    });
  }
  function setAccountOwner(id, name) {
    const a = accounts.find((x) => x.id === id);
    if (!a || !name || !String(name).trim()) return null;
    a.owner = String(name).trim();
    const ov = ownerOverrides();
    ov[id] = a.owner;
    try { localStorage.setItem(OWNER_OVERRIDES_KEY, JSON.stringify(ov)); } catch (e) {}
    return a;
  }

  // ---- Custom accounts (created on the Accounts page) -----------------
  // Stored in localStorage as an array of account objects so they survive
  // reloads. Appended to `accounts` on every load — before owner overrides
  // are applied — with ids remapped upward if a live row already took one.
  const CUSTOM_ACCOUNTS_KEY = "kodiakCrmCustomAccounts";
  function lsList(key) {
    try { const v = JSON.parse(lsGet(key)); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function lsSetList(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {}
  }
  function maxAccountId(extra) {
    let max = 0;
    accounts.concat(extra || []).forEach((a) => {
      const n = Number(a && a.id);
      if (isFinite(n) && n > max) max = n;
    });
    return max;
  }
  function appendCustomAccounts() {
    const saved = lsList(CUSTOM_ACCOUNTS_KEY);
    let changed = false;
    saved.forEach((a) => {
      if (!a || a.id == null) return;
      if (accounts.some((x) => Number(x.id) === Number(a.id))) {
        a.id = maxAccountId() + 1;             // live row took this id → remap upward
        changed = true;
      }
      accounts.push(a);
    });
    if (changed) lsSetList(CUSTOM_ACCOUNTS_KEY, saved);
  }
  function addAccount(fields) {
    const acct = Object.assign(
      { name:"", type:"", city:"", state:"", contact:"", title:"", phone:"", email:"", owner:"" },
      fields, { id: maxAccountId(lsList(CUSTOM_ACCOUNTS_KEY)) + 1 }
    );
    if (!acct.owner) acct.owner = reps[0] || "";
    accounts.push(acct);
    const saved = lsList(CUSTOM_ACCOUNTS_KEY);
    saved.push(acct);
    lsSetList(CUSTOM_ACCOUNTS_KEY, saved);
    return acct;
  }

  // ---- Rep (owner-name) management -------------------------------------
  // Effective reps = (default reps − removed) + custom names. Pages hold a
  // reference to `KODIAK_CRM.reps`, so refreshReps() mutates the array in
  // place instead of reassigning it. Removing a rep never rewrites existing
  // accounts' .owner values — it only leaves the list.
  const DEFAULT_REPS = reps.slice();
  const CUSTOM_REPS_KEY = "kodiakCrmCustomReps";
  const REMOVED_REPS_KEY = "kodiakCrmRemovedReps";
  const sameName = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
  // One-time migration from the older *Owners localStorage keys.
  [["kodiakCrmCustomOwners", CUSTOM_REPS_KEY], ["kodiakCrmRemovedOwners", REMOVED_REPS_KEY]]
    .forEach(([oldKey, newKey]) => {
      const old = lsList(oldKey);
      if (old.length) {
        const cur = lsList(newKey);
        old.forEach((n) => { if (n && !cur.some((c) => sameName(c, n))) cur.push(n); });
        lsSetList(newKey, cur);
      }
      try { localStorage.removeItem(oldKey); } catch (e) {}
    });
  function refreshReps() {
    const removed = lsList(REMOVED_REPS_KEY);
    const out = [];
    DEFAULT_REPS.concat(lsList(CUSTOM_REPS_KEY)).forEach((n) => {
      if (n && !removed.some((r) => sameName(r, n)) && !out.some((o) => sameName(o, n))) out.push(n);
    });
    reps.splice(0, reps.length, ...out);
    return reps;
  }
  function addRep(name) {
    name = String(name == null ? "" : name).trim();
    if (!name) return reps;
    const removed = lsList(REMOVED_REPS_KEY);
    const ri = removed.findIndex((r) => sameName(r, name));
    if (ri > -1) {                             // hidden built-in → un-remove, don't duplicate
      removed.splice(ri, 1);
      lsSetList(REMOVED_REPS_KEY, removed);
    } else {
      const custom = lsList(CUSTOM_REPS_KEY);
      if (!DEFAULT_REPS.some((r) => sameName(r, name)) && !custom.some((c) => sameName(c, name))) {
        custom.push(name);
        lsSetList(CUSTOM_REPS_KEY, custom);
      }
    }
    return refreshReps();
  }
  function removeRep(name) {
    name = String(name == null ? "" : name).trim();
    if (!name) return reps;
    const custom = lsList(CUSTOM_REPS_KEY);
    const ci = custom.findIndex((c) => sameName(c, name));
    if (ci > -1) {
      custom.splice(ci, 1);
      lsSetList(CUSTOM_REPS_KEY, custom);
    } else if (DEFAULT_REPS.some((r) => sameName(r, name))) {
      const removed = lsList(REMOVED_REPS_KEY);
      if (!removed.some((r) => sameName(r, name))) {
        removed.push(DEFAULT_REPS.find((r) => sameName(r, name)));
        lsSetList(REMOVED_REPS_KEY, removed);
      }
    }
    return refreshReps();
  }
  refreshReps();                               // apply persisted add/removes at load
  // Back-compat aliases (older pages call the *Owner names).
  const getOwners = () => reps.slice();
  function addOwner(name) { addRep(name); name = String(name == null ? "" : name).trim(); return name || null; }
  const removeOwner = removeRep;

  let dataSource = "Demo data (local)";
  // `ready` resolves once live data has been loaded (or the fallback kept).
  const ready = (async () => {
    if (dataMode === "demo") {                 // forced offline: never call the API
      dataSource = "Demo data (forced)";
      appendCustomAccounts();
      applyOwnerOverrides();
      return dataSource;
    }
    const [acc, opp, prj, est, act, lds, rfa, wos, ctr] = await Promise.all([
      apiGet("accounts"), apiGet("opportunities"), apiGet("projects"),
      apiGet("estimates"), apiGet("activities"), apiGet("leads"),
      apiGet("roofassets"), apiGet("workorders"), apiGet("contracts")
    ]);
    if (acc && opp) {
      swap(accounts, acc); swap(opportunities, opp);
      swap(projects, prj); swap(estimates, est); swap(activities, act);
      swap(leads, lds);
      swap(roofAssets, rfa); swap(workOrders, wos); swap(contracts, ctr);
      dataSource = "Azure SQL (live)";
    } else if (dataMode === "live") {          // live only: never show demo rows
      emptyAll();
      dataSource = "Live mode — backend unreachable";
    }
    appendCustomAccounts();                    // user-created accounts always show
    applyOwnerOverrides();                     // owner edits win over demo & live rows
    return dataSource;
  })();

  return {
    STAGES, SERVICES, SYSTEMS, reps,
    WO_TYPES, WO_STATUSES, WO_PRIORITIES, TECHS,
    accounts, opportunities, projects, estimates, activities, leads,
    roofAssets, workOrders, contracts,
    serviceMetrics, woByStatus, techLoad, slaInfo,
    roofAssetsFor, workOrdersFor, roofAsset, contract,
    fmt, fmtShort, metrics, byStage, apiGet, API_BASE, ready, setAccountOwner,
    addAccount, addRep, removeRep, refreshReps,
    getOwners, addOwner, removeOwner,
    get source() { return dataSource; },
    get dataMode() { return dataMode; },
    account: (id) => accounts.find(a=>a.id===id)
  };
})();

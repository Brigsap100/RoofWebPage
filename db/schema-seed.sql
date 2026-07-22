/* ============================================================
   Kodiak CRM — Azure SQL Database schema + seed data
   Generated from crm/js/data.js (demo dataset); Leads seeds are
   independent samples (runtime rows come from POST /api/lead).
   Row counts: Accounts 12, Opportunities 20, Projects 5,
               Estimates 7, Activities 8, Leads 4,
               RoofAssets 13, ServiceContracts 7, WorkOrders 16
   ============================================================ */

-- ---- Drop children before parents -------------------------------------
DROP TABLE IF EXISTS dbo.WorkOrders;
DROP TABLE IF EXISTS dbo.ServiceContracts;
DROP TABLE IF EXISTS dbo.RoofAssets;
DROP TABLE IF EXISTS dbo.Estimates;
DROP TABLE IF EXISTS dbo.Activities;
DROP TABLE IF EXISTS dbo.Projects;
DROP TABLE IF EXISTS dbo.Opportunities;
DROP TABLE IF EXISTS dbo.Accounts;
DROP TABLE IF EXISTS dbo.Leads;   -- no FK dependents; order flexible
GO

-- ---- Create parents before children ------------------------------------
CREATE TABLE dbo.Accounts (
    Id      INT            PRIMARY KEY,
    Name    NVARCHAR(200)  NOT NULL,
    Type    NVARCHAR(50),
    City    NVARCHAR(100),
    State   NVARCHAR(2),
    Contact NVARCHAR(100),
    Title   NVARCHAR(100),
    Phone   NVARCHAR(30),
    Email   NVARCHAR(200),
    Owner   NVARCHAR(100)
);
GO

CREATE TABLE dbo.Opportunities (
    Id         INT            PRIMARY KEY,
    Name       NVARCHAR(200)  NOT NULL,
    AccountId  INT            NOT NULL REFERENCES dbo.Accounts(Id),
    Stage      NVARCHAR(30)   NOT NULL,
    Service    NVARCHAR(100),
    SystemType NVARCHAR(100),
    Value      DECIMAL(12,2),
    Sqft       INT,
    CloseDate  DATE,
    Owner      NVARCHAR(100),
    Prob       DECIMAL(4,2)
);
GO

CREATE TABLE dbo.Projects (
    Id         INT            PRIMARY KEY,
    Name       NVARCHAR(200)  NOT NULL,
    AccountId  INT            NOT NULL REFERENCES dbo.Accounts(Id),
    Value      DECIMAL(12,2),
    Sqft       INT,
    SystemType NVARCHAR(100),
    Status     NVARCHAR(30),
    Pct        INT,
    PM         NVARCHAR(100),
    StartDate  DATE,
    EndDate    DATE
);
GO

CREATE TABLE dbo.Estimates (
    Id            INT            PRIMARY KEY,
    Number        NVARCHAR(30)   NOT NULL,
    OpportunityId INT            NOT NULL REFERENCES dbo.Opportunities(Id),
    Account       NVARCHAR(200),
    Amount        DECIMAL(12,2),
    Status        NVARCHAR(20),
    EstDate       DATE
);
GO

CREATE TABLE dbo.Activities (
    Id      INT            PRIMARY KEY,
    Type    NVARCHAR(30),
    Subject NVARCHAR(200),
    Account NVARCHAR(200),
    Owner   NVARCHAR(100),
    DueDate DATE,
    Done    BIT
);
GO

-- Leads are inserted at runtime (website forms), so Id is IDENTITY here
-- rather than a fixed value like the other tables.
CREATE TABLE dbo.Leads (
    Id          INT            IDENTITY(1,1) PRIMARY KEY,
    Source      NVARCHAR(40),
    Name        NVARCHAR(200),
    Company     NVARCHAR(200),
    Email       NVARCHAR(200),
    Phone       NVARCHAR(30),
    Service     NVARCHAR(120),
    Position    NVARCHAR(120),
    Message     NVARCHAR(MAX),
    Status      NVARCHAR(20)   NOT NULL DEFAULT 'new',
    CreatedDate DATE           NOT NULL DEFAULT CAST(SYSUTCDATETIME() AS DATE),
    Owner       NVARCHAR(100)  NULL
);
GO

-- ---- Seed: Accounts (12 rows) -------------------------------------------
INSERT INTO dbo.Accounts (Id, Name, Type, City, State, Contact, Title, Phone, Email, Owner) VALUES
 (1,  N'Google (Bay View Campus)',    N'Owner',              N'Mountain View',   N'CA', N'Dana Reyes',    N'Facilities Director',   N'650-555-0142', N'dreyes@example.com',    N'Marcus Hale'),
 (2,  N'Sacramento Kings — Golden 1', N'Owner',              N'Sacramento',      N'CA', N'Priya Shah',    N'VP Operations',         N'916-555-0110', N'pshah@example.com',     N'Marcus Hale'),
 (3,  N'Carson Tahoe Health',         N'Owner',              N'Carson City',     N'NV', N'Dave Lamb',     N'Facilities Manager',    N'775-555-0199', N'dlamb@example.com',     N'Elena Ortiz'),
 (4,  N'Enso Village',                N'Property Manager',   N'Healdsburg',      N'CA', N'James Averill', N'Assistant PM',          N'707-555-0163', N'javerill@example.com',  N'Elena Ortiz'),
 (5,  N'Midway Commerce Center',      N'Owner',              N'Vacaville',       N'CA', N'Karen Wu',      N'Asset Manager',         N'707-555-0177', N'kwu@example.com',       N'Marcus Hale'),
 (6,  N'Turner Construction',         N'General Contractor', N'Sacramento',      N'CA', N'Rob Mitchell',  N'Senior PM',             N'916-555-0128', N'rmitchell@example.com', N'Sofia Nguyen'),
 (7,  N'Reno Logistics Park',         N'Owner',              N'Reno',            N'NV', N'Alan Pierce',   N'Operations Lead',       N'775-555-0121', N'apierce@example.com',   N'Elena Ortiz'),
 (8,  N'Delta Cold Storage',          N'Owner',              N'Stockton',        N'CA', N'Maria Gomez',   N'Plant Manager',         N'209-555-0155', N'mgomez@example.com',    N'Sofia Nguyen'),
 (9,  N'Foothill School District',    N'Owner',              N'Roseville',       N'CA', N'Tom Barnes',    N'Facilities Supervisor', N'916-555-0184', N'tbarnes@example.com',   N'Marcus Hale'),
 (10, N'Sierra Medical Plaza',        N'Property Manager',   N'Reno',            N'NV', N'Nina Patel',    N'Property Manager',      N'775-555-0137', N'npatel@example.com',    N'Elena Ortiz'),
 (11, N'BayFront Tech Center',        N'Owner',              N'Fremont',         N'CA', N'Greg Olson',    N'Facilities Director',   N'510-555-0146', N'golson@example.com',    N'Sofia Nguyen'),
 (12, N'Hexcel Manufacturing',        N'Owner',              N'West Sacramento', N'CA', N'Lena Ford',     N'EHS Manager',           N'916-555-0173', N'lford@example.com',     N'Marcus Hale');
GO

-- ---- Service Department: roof inventory, contracts, work orders ----------
CREATE TABLE dbo.RoofAssets (
    Id                 INT            PRIMARY KEY,
    AccountId          INT            NOT NULL REFERENCES dbo.Accounts(Id),
    Building           NVARCHAR(120)  NOT NULL,
    Address            NVARCHAR(200),
    SectionCode        NVARCHAR(20),
    SystemType         NVARCHAR(100),
    Sqft               INT,
    InstallYear        INT,
    ConditionScore     INT,
    RemainingLifeYears INT,
    WarrantyType       NVARCHAR(60),
    WarrantyExpiry     DATE,
    AccessNotes        NVARCHAR(300)
);
GO

CREATE TABLE dbo.ServiceContracts (
    Id               INT            PRIMARY KEY,
    Number           NVARCHAR(20)   NOT NULL,
    AccountId        INT            NOT NULL REFERENCES dbo.Accounts(Id),
    Tier             NVARCHAR(12),
    BillingFrequency NVARCHAR(12),
    AnnualValue      DECIMAL(10,2),
    StartDate        DATE,
    EndDate          DATE,
    VisitsPerYear    INT,
    VisitsCompleted  INT            NOT NULL DEFAULT 0,
    NextVisitDue     DATE,
    Status           NVARCHAR(12)   NOT NULL DEFAULT 'active',
    BuildingsCovered INT
);
GO

-- Work orders are also created at runtime (public service-request form), so
-- Id is IDENTITY, seeded at 101. AccountId is intentionally NULL-able: public
-- service requests may not match an account.
CREATE TABLE dbo.WorkOrders (
    Id            INT            IDENTITY(101,1) PRIMARY KEY,
    Number        NVARCHAR(20),
    AccountId     INT            NULL REFERENCES dbo.Accounts(Id),
    RoofAssetId   INT            NULL REFERENCES dbo.RoofAssets(Id),
    ContractId    INT            NULL REFERENCES dbo.ServiceContracts(Id),
    Type          NVARCHAR(30)   NOT NULL,
    Priority      NVARCHAR(12)   NOT NULL DEFAULT 'Standard',
    Status        NVARCHAR(15)   NOT NULL DEFAULT 'new',
    Problem       NVARCHAR(MAX),
    LeakLocation  NVARCHAR(200),
    ReportedAt    DATETIME2(0)   NOT NULL DEFAULT SYSUTCDATETIME(),
    ScheduledDate DATE           NULL,
    CompletedAt   DATETIME2(0)   NULL,
    Tech          NVARCHAR(100)  NULL,
    NteAmount     DECIMAL(10,2)  NULL,
    PoNumber      NVARCHAR(40)   NULL,
    Resolution    NVARCHAR(MAX)  NULL,
    PhotosBefore  INT            NOT NULL DEFAULT 0,
    PhotosAfter   INT            NOT NULL DEFAULT 0,
    Deficiencies  INT            NULL,
    InvoiceAmount DECIMAL(10,2)  NULL
);
GO

-- ---- Seed: Opportunities (20 rows) ---------------------------------------
-- Owner comes from the parent account's owner; Prob from STAGES
-- (lead 0.10, inspection 0.25, estimating 0.45, bid 0.65,
--  negotiation 0.80, won 1.00, lost 0.00)
INSERT INTO dbo.Opportunities (Id, Name, AccountId, Stage, Service, SystemType, Value, Sqft, CloseDate, Owner, Prob) VALUES
 (1,  N'Bay View Roof Restoration',         1,  N'estimating',  N'Commercial Re-Roofing',      N'TPO Single-Ply',         1850000.00, 240000, '2026-09-15', N'Marcus Hale',  0.45),
 (2,  N'Golden 1 Arena Re-Roof',            2,  N'negotiation', N'Commercial Re-Roofing',      N'PVC Single-Ply',         2650000.00, 180000, '2026-08-30', N'Marcus Hale',  0.80),
 (3,  N'Carson Tahoe Waterproofing',        3,  N'won',         N'Commercial Waterproofing',   N'Modified Bitumen',        720000.00,  60000, '2026-06-01', N'Elena Ortiz',  1.00),
 (4,  N'Enso Village Maintenance Program',  4,  N'bid',         N'Preventative Maintenance',   N'EPDM',                    180000.00,  90000, '2026-08-10', N'Elena Ortiz',  0.65),
 (5,  N'Midway Metal Roof Install',         5,  N'inspection',  N'Metal Roofing & Panels',     N'Standing-Seam Metal',    1250000.00, 150000, '2026-10-05', N'Marcus Hale',  0.25),
 (6,  N'Turner — Downtown Tower Roof',      6,  N'estimating',  N'Commercial Re-Roofing',      N'TPO Single-Ply',         3100000.00, 210000, '2026-11-01', N'Sofia Nguyen', 0.45),
 (7,  N'Reno Logistics Warehouse Re-Roof',  7,  N'lead',        N'Commercial Re-Roofing',      N'TPO Single-Ply',          980000.00, 320000, '2026-12-01', N'Elena Ortiz',  0.10),
 (8,  N'Delta Cold Storage Leak Repair',    8,  N'won',         N'24/7 Emergency Leak Repair', N'Built-Up (BUR)',          145000.00,  40000, '2026-05-20', N'Sofia Nguyen', 1.00),
 (9,  N'Foothill District Roof Survey',     9,  N'inspection',  N'Preventative Maintenance',   N'Modified Bitumen',         95000.00, 120000, '2026-09-01', N'Marcus Hale',  0.25),
 (10, N'Sierra Medical Plaza Restoration',  10, N'bid',         N'Roof Life Extension',        N'TPO Single-Ply',          560000.00,  72000, '2026-08-25', N'Elena Ortiz',  0.65),
 (11, N'BayFront Tech Waterproofing',       11, N'estimating',  N'Commercial Waterproofing',   N'PVC Single-Ply',          640000.00,  54000, '2026-10-15', N'Sofia Nguyen', 0.45),
 (12, N'Hexcel Plant Emergency Repair',     12, N'won',         N'24/7 Emergency Leak Repair', N'Metal Roofing & Panels',  210000.00,  30000, '2026-04-18', N'Marcus Hale',  1.00),
 (13, N'Reno Logistics — Building B',       7,  N'lead',        N'Metal Roofing & Panels',     N'Standing-Seam Metal',    1450000.00, 260000, '2027-01-10', N'Elena Ortiz',  0.10),
 (14, N'Google Annex Waterproofing',        1,  N'bid',         N'Waterproofing Injections',   N'Modified Bitumen',        340000.00,  18000, '2026-09-05', N'Marcus Hale',  0.65),
 (15, N'Foothill HS Gym Re-Roof',           9,  N'lost',        N'Commercial Re-Roofing',      N'Built-Up (BUR)',          480000.00,  45000, '2026-05-01', N'Marcus Hale',  0.00),
 (16, N'Delta Cold Storage Expansion Roof', 8,  N'estimating',  N'Commercial Roofing',         N'EPDM',                    890000.00, 110000, '2026-11-20', N'Sofia Nguyen', 0.45),
 (17, N'Sierra Medical HVAC Deck Seal',     10, N'negotiation', N'Commercial Waterproofing',   N'PVC Single-Ply',          275000.00,  22000, '2026-08-18', N'Elena Ortiz',  0.80),
 (18, N'Turner — Parking Structure Deck',   6,  N'lead',        N'Commercial Waterproofing',   N'Modified Bitumen',        520000.00,  88000, '2026-12-15', N'Sofia Nguyen', 0.10),
 (19, N'BayFront Roof Life Extension',      11, N'won',         N'Roof Life Extension',        N'TPO Single-Ply',          430000.00,  64000, '2026-03-30', N'Sofia Nguyen', 1.00),
 (20, N'Midway Warehouse 3 Re-Roof',        5,  N'bid',         N'Commercial Re-Roofing',      N'TPO Single-Ply',         1120000.00, 170000, '2026-10-28', N'Marcus Hale',  0.65);
GO

-- ---- Seed: Projects (5 rows) ----------------------------------------------
INSERT INTO dbo.Projects (Id, Name, AccountId, Value, Sqft, SystemType, Status, Pct, PM, StartDate, EndDate) VALUES
 (1, N'Carson Tahoe Waterproofing',     3,  720000.00, 60000, N'Modified Bitumen',       N'In Progress', 65,  N'Elena Ortiz',  '2026-06-10', '2026-09-30'),
 (2, N'Delta Cold Storage Leak Repair', 8,  145000.00, 40000, N'Built-Up (BUR)',         N'Complete',    100, N'Sofia Nguyen', '2026-05-22', '2026-06-15'),
 (3, N'Hexcel Plant Emergency Repair',  12, 210000.00, 30000, N'Metal Roofing & Panels', N'Complete',    100, N'Marcus Hale',  '2026-04-19', '2026-05-10'),
 (4, N'BayFront Roof Life Extension',   11, 430000.00, 64000, N'TPO Single-Ply',         N'In Progress', 40,  N'Sofia Nguyen', '2026-04-05', '2026-08-15'),
 (5, N'Sierra Medical HVAC Deck Seal',  10, 275000.00, 22000, N'PVC Single-Ply',         N'Scheduled',   5,   N'Elena Ortiz',  '2026-09-01', '2026-10-20');
GO

-- ---- Seed: Estimates (7 rows) ----------------------------------------------
INSERT INTO dbo.Estimates (Id, Number, OpportunityId, Account, Amount, Status, EstDate) VALUES
 (1, N'EST-2026-041', 1,  N'Google (Bay View Campus)',    1850000.00, N'Draft',    '2026-07-12'),
 (2, N'EST-2026-039', 2,  N'Sacramento Kings — Golden 1', 2650000.00, N'Sent',     '2026-07-05'),
 (3, N'EST-2026-036', 4,  N'Enso Village',                 180000.00, N'Sent',     '2026-06-28'),
 (4, N'EST-2026-044', 10, N'Sierra Medical Plaza',         560000.00, N'Sent',     '2026-07-15'),
 (5, N'EST-2026-030', 3,  N'Carson Tahoe Health',          720000.00, N'Accepted', '2026-05-25'),
 (6, N'EST-2026-046', 14, N'Google (Bay View Campus)',     340000.00, N'Sent',     '2026-07-18'),
 (7, N'EST-2026-028', 15, N'Foothill School District',     480000.00, N'Rejected', '2026-04-22');
GO

-- ---- Seed: Activities (8 rows) ----------------------------------------------
INSERT INTO dbo.Activities (Id, Type, Subject, Account, Owner, DueDate, Done) VALUES
 (1, N'Site Visit', N'Roof inspection — Bay View',  N'Google (Bay View Campus)',    N'Marcus Hale',  '2026-07-24', 0),
 (2, N'Call',       N'Follow up on Golden 1 bid',   N'Sacramento Kings — Golden 1', N'Marcus Hale',  '2026-07-22', 0),
 (3, N'Email',      N'Send maintenance proposal',   N'Enso Village',                N'Elena Ortiz',  '2026-07-23', 0),
 (4, N'Meeting',    N'Kickoff — Carson Tahoe',      N'Carson Tahoe Health',         N'Elena Ortiz',  '2026-07-21', 1),
 (5, N'Site Visit', N'Measure Midway warehouse',    N'Midway Commerce Center',      N'Marcus Hale',  '2026-07-28', 0),
 (6, N'Call',       N'Reno logistics intro call',   N'Reno Logistics Park',         N'Elena Ortiz',  '2026-07-25', 0),
 (7, N'Email',      N'Estimate revision — Sierra',  N'Sierra Medical Plaza',        N'Elena Ortiz',  '2026-07-26', 0),
 (8, N'Meeting',    N'Turner PM sync',              N'Turner Construction',         N'Sofia Nguyen', '2026-07-29', 0);
GO

-- ---- Seed: Leads (4 rows) --------------------------------------------------
-- Id is IDENTITY, so it is omitted and assigned automatically. Status and
-- CreatedDate are given explicitly here to vary the seed data.
INSERT INTO dbo.Leads (Source, Name, Company, Email, Phone, Service, Position, Message, Status, CreatedDate, Owner) VALUES
 (N'website-contact',     N'Grace Holloway', N'Northgate Retail Group', N'gholloway@example.com', N'916-555-0231', N'Commercial Re-Roofing',      NULL,                  N'Two of our warehouse roofs are leaking after the last storm — need an inspection ASAP.', N'new',       '2026-07-03', NULL),
 (N'website-contact',     N'Victor Nunez',   N'Delta Property Partners', N'vnunez@example.com',   N'209-555-0288', N'Preventative Maintenance',   NULL,                  N'Looking for an annual maintenance program across a 6-building portfolio.',               N'contacted', '2026-07-09', N'Marcus Hale'),
 (N'careers-application', N'Priya Deshpande', NULL,                     N'pdeshpande@example.com', N'775-555-0142', NULL,                          N'Estimator',          N'8 years estimating commercial TPO and PVC systems. Resume attached via portal.',         N'new',       '2026-07-14', NULL),
 (N'careers-application', N'Marcus Bell',     NULL,                     N'mbell@example.com',      N'510-555-0119', NULL,                          N'Roofing Foreman',    N'Journeyman foreman, 12 years single-ply and metal. Available to start immediately.',     N'contacted', '2026-07-19', N'Elena Ortiz');
GO

-- ---- Seed: RoofAssets (13 rows) ---------------------------------------------
-- Roof inventory across the account portfolio. Google (1) has two sections of
-- the same building; Reno Logistics (7) and Delta Cold Storage (8) have two
-- buildings each. Turner (6, GC) and Midway (5, still in sales pipeline) have
-- no serviced roofs yet.
INSERT INTO dbo.RoofAssets (Id, AccountId, Building, Address, SectionCode, SystemType, Sqft, InstallYear, ConditionScore, RemainingLifeYears, WarrantyType, WarrantyExpiry, AccessNotes) VALUES
 (1,  1,  N'Bay View Main Campus',      N'1100 Shoreline Blvd, Mountain View, CA',  N'A',    N'TPO Single-Ply',         140000, 2021, 4, 12, N'Manufacturer NDL 20-yr', '2041-05-31', N'Badge in at Security Bldg 1; escort required on roof at all times'),
 (2,  1,  N'Bay View Main Campus',      N'1100 Shoreline Blvd, Mountain View, CA',  N'B',    N'TPO Single-Ply',         100000, 2021, 5, 13, N'Manufacturer NDL 20-yr', '2041-05-31', N'Roof hatch in mech room B2; escort required; no work during campus events'),
 (3,  2,  N'Golden 1 Center',           N'500 David J Stern Walk, Sacramento, CA',  N'MAIN', N'PVC Single-Ply',         180000, 2016, 3, 6,  N'Manufacturer 15-yr',     '2031-09-30', N'Night access only on event days; check in at loading dock security'),
 (4,  3,  N'Main Hospital Tower',       N'1600 Medical Pkwy, Carson City, NV',      N'T1',   N'Modified Bitumen',       60000,  2012, 2, 3,  N'Contractor 10-yr',       '2026-11-30', N'Check in at facilities office; infection-control permit required near air intakes'),
 (5,  4,  N'Community Commons',         N'100 Enso Way, Healdsburg, CA',            N'C1',   N'EPDM',                   45000,  2018, 3, 8,  N'Manufacturer 15-yr',     '2033-04-30', N'Gate code 4482; residents on site — quiet hours before 9am'),
 (6,  7,  N'Warehouse A',               N'2200 Logistics Way, Reno, NV',            N'A',    N'TPO Single-Ply',         320000, 2014, 2, 2,  N'Contractor 10-yr',       '2026-08-31', N'Gate code 7719; interior ladder at dock office; forklift traffic below'),
 (7,  7,  N'Building B',                N'2300 Logistics Way, Reno, NV',            N'B',    N'Standing-Seam Metal',    260000, 2009, 3, 9,  N'Manufacturer 20-yr',     '2029-06-30', N'Exterior fixed ladder on north wall; harness tie-offs at ridge'),
 (8,  8,  N'Cold Storage Plant 1',      N'800 Port Rd, Stockton, CA',               N'P1',   N'Built-Up (BUR)',         40000,  2008, 2, 1,  N'None (expired)',         '2018-03-31', N'Check in at guard shack; hairnet and thermal PPE required inside plant'),
 (9,  8,  N'Expansion Building 2',      N'820 Port Rd, Stockton, CA',               N'P2',   N'EPDM',                   110000, 2024, 5, 14, N'Manufacturer NDL 20-yr', '2044-10-31', N'Gate code 3145; roof hatch by compressor room; notify plant manager on arrival'),
 (10, 9,  N'Foothill HS Gymnasium',     N'450 School House Rd, Roseville, CA',      N'GYM',  N'Built-Up (BUR)',         45000,  2005, 2, 2,  N'None (expired)',         '2020-06-30', N'Check in at district office; no ladder work during passing periods'),
 (11, 10, N'Medical Office Building',   N'75 Sierra Plaza Dr, Reno, NV',            N'MOB',  N'TPO Single-Ply',         72000,  2015, 3, 7,  N'Manufacturer 15-yr',     '2030-08-31', N'Escort required near rooftop HVAC; badge at property management suite 110'),
 (12, 11, N'Tech Center North',         N'4400 Bayside Pkwy, Fremont, CA',          N'N',    N'TPO Single-Ply',         64000,  2026, 5, 15, N'Manufacturer NDL 20-yr', '2046-03-31', N'Exterior fixed ladder at NE corner; keycard from lobby security'),
 (13, 12, N'Plant 4',                   N'900 Industrial Blvd, West Sacramento, CA', N'P4',  N'Standing-Seam Metal',    30000,  2010, 3, 10, N'Manufacturer 20-yr',     '2027-02-28', N'EHS orientation required before first visit; hot-work permit for any torch/weld');
GO

-- ---- Seed: ServiceContracts (7 rows) ------------------------------------------
-- Tiers: Platinum = 12 visits/yr (Monthly), Gold = 4 (Quarterly), Silver = 2 (Annual)
INSERT INTO dbo.ServiceContracts (Id, Number, AccountId, Tier, BillingFrequency, AnnualValue, StartDate, EndDate, VisitsPerYear, VisitsCompleted, NextVisitDue, Status, BuildingsCovered) VALUES
 (1, N'SC-2026-01', 1,  N'Platinum', N'Monthly',   96000.00, '2026-01-01', '2026-12-31', 12, 6, '2026-08-01', N'active',   2),
 (2, N'SC-2026-02', 8,  N'Platinum', N'Monthly',   72000.00, '2025-10-01', '2026-09-30', 12, 9, '2026-07-10', N'expiring', 2),
 (3, N'SC-2026-03', 3,  N'Gold',     N'Quarterly', 48000.00, '2026-02-01', '2027-01-31', 4,  2, '2026-08-15', N'active',   1),
 (4, N'SC-2026-04', 4,  N'Gold',     N'Quarterly', 36000.00, '2026-03-01', '2027-02-28', 4,  1, '2026-09-01', N'active',   1),
 (5, N'SC-2026-05', 10, N'Gold',     N'Quarterly', 30000.00, '2026-01-15', '2027-01-14', 4,  2, '2026-10-15', N'active',   1),
 (6, N'SC-2026-06', 9,  N'Silver',   N'Annual',    18000.00, '2025-07-01', '2026-06-30', 2,  2, NULL,         N'expired',  1),
 (7, N'SC-2026-07', 11, N'Silver',   N'Annual',    22000.00, '2026-04-01', '2027-03-31', 2,  1, '2026-10-01', N'active',   1);
GO

-- ---- Seed: WorkOrders (16 rows) --------------------------------------------------
-- Id is IDENTITY(101,1), so it is omitted; rows get Ids 101-116 and Number
-- matches ('WO-2026-101'..'WO-2026-116'). WO-2026-116 is an unmatched public
-- service request (AccountId NULL).
INSERT INTO dbo.WorkOrders (Number, AccountId, RoofAssetId, ContractId, Type, Priority, Status, Problem, LeakLocation, ReportedAt, ScheduledDate, CompletedAt, Tech, NteAmount, PoNumber, Resolution, PhotosBefore, PhotosAfter, Deficiencies, InvoiceAmount) VALUES
 (N'WO-2026-101', 8,    8,    2,    N'Emergency',                N'Emergency', N'completed',   N'Active leak over freezer bay 3 during overnight storm; product at risk.',                          N'Freezer bay 3, NW corner near curb',        '2026-07-02T03:15:00', '2026-07-02', '2026-07-02T06:05:00', N'Ray Delgado',    5000.00,  N'PO-DCS-4471', N'Emergency patch at split BUR flashing; temporary seal, permanent repair recommended.', 4, 3, NULL, 4850.00),
 (N'WO-2026-102', 10,   11,   NULL, N'Leak Call',                N'High',      N'invoiced',    N'Tenant in suite 210 reports ceiling stain spreading after last rain.',                             N'Above suite 210, east of RTU-4',            '2026-07-03T14:20:00', '2026-07-06', '2026-07-06T16:40:00', N'Jimmy Park',     2500.00,  N'PO-SMP-1088', N'Resealed pitch pocket and lap seam at RTU-4 curb; water-tested.',                      3, 2, NULL, 1975.00),
 (N'WO-2026-103', 1,    1,    1,    N'Preventative Maintenance', N'Standard',  N'closed',      N'July contract visit — Section A: clean drains, inspect seams and penetrations.',                   NULL,                                          '2026-07-01T08:00:00', '2026-07-08', '2026-07-08T15:30:00', N'Colleen Reyes',  NULL,     NULL,           N'Monthly PM visit complete; drains cleared, two seam probes resealed.',                 6, 6, NULL, 8000.00),
 (N'WO-2026-104', 9,    10,   NULL, N'Repair',                   N'Standard',  N'invoiced',    N'Blistered BUR field membrane over gym east slope; approved summer repair.',                        NULL,                                          '2026-07-05T09:10:00', '2026-07-09', '2026-07-09T14:00:00', N'Omar Sissoko',   7500.00,  N'PO-FSD-2210', N'Cut out and patched 6 blisters; re-coated repair area with aluminum coating.',         5, 5, NULL, 6320.00),
 (N'WO-2026-105', 7,    6,    NULL, N'Inspection',               N'Standard',  N'completed',   N'Pre-renewal condition inspection of Warehouse A ahead of warranty expiry.',                        NULL,                                          '2026-07-06T10:00:00', '2026-07-10', '2026-07-10T13:15:00', N'Ray Delgado',    NULL,     NULL,           N'Inspection complete; 7 deficiencies documented, repair proposal to follow.',           12, 0, 7,   1500.00),
 (N'WO-2026-106', 11,   12,   NULL, N'Leak Call',                N'Standard',  N'cancelled',   N'Reported drip in server room ceiling on 3rd floor.',                                               N'Server room 310 ceiling grid',              '2026-07-07T11:45:00', NULL,         NULL,                  NULL,             NULL,     NULL,           N'Cancelled — owner''s mechanical vendor traced drip to HVAC condensate line, not roof.', 0, 0, NULL, NULL),
 (N'WO-2026-107', 4,    5,    4,    N'Preventative Maintenance', N'Standard',  N'completed',   N'Q3 contract visit — Commons: clean gutters/drains, inspect EPDM seams and terminations.',          NULL,                                          '2026-07-08T08:00:00', '2026-07-13', '2026-07-13T12:20:00', N'Jimmy Park',     NULL,     NULL,           N'Quarterly PM visit complete; debris removed, one termination bar re-fastened.',        5, 5, NULL, 9000.00),
 (N'WO-2026-108', 2,    3,    NULL, N'Warranty Claim',           N'High',      N'on-hold',     N'Recurring seam failures on PVC membrane, upper bowl roof; filed under 15-yr manufacturer warranty.', N'Upper bowl, gridline H between RD-12 and RD-14', '2026-07-09T13:30:00', NULL,     NULL,                  N'Colleen Reyes',  NULL,     NULL,           NULL,                                                                                    8, 0, NULL, NULL),
 (N'WO-2026-109', 12,   13,   NULL, N'Emergency',                N'Emergency', N'in-progress', N'Wind-lifted ridge panels overnight; water entering production area, line 2 stopped.',              N'Plant 4 ridge, above production line 2',    '2026-07-20T04:55:00', '2026-07-20', NULL,                  N'Ray Delgado',    15000.00, N'PO-HEX-9034', NULL,                                                                                    5, 0, NULL, NULL),
 (N'WO-2026-110', 3,    4,    NULL, N'Repair',                   N'High',      N'in-progress', N'Deteriorated mod-bit flashings at parapet, tower roof; approved repair from spring inspection.',   NULL,                                          '2026-07-10T09:25:00', '2026-07-16', NULL,                  N'Omar Sissoko',   12000.00, N'PO-CTH-5512', NULL,                                                                                    4, 0, NULL, NULL),
 (N'WO-2026-111', 1,    2,    NULL, N'Leak Call',                N'High',      N'scheduled',   N'Drip reported in atrium ceiling, Section B, after fog condensation event.',                        N'Atrium skylight curb, Section B',           '2026-07-18T07:40:00', '2026-07-23', NULL,                  N'Jimmy Park',     3500.00,  N'PO-GOO-7781', NULL,                                                                                    2, 0, NULL, NULL),
 (N'WO-2026-112', 10,   11,   5,    N'Preventative Maintenance', N'Standard',  N'dispatched',  N'Q3 contract visit — MOB: drain cleaning, walk-pad check, seam inspection.',                        NULL,                                          '2026-07-15T08:00:00', '2026-07-22', NULL,                  N'Colleen Reyes',  NULL,     NULL,           NULL,                                                                                    0, 0, NULL, NULL),
 (N'WO-2026-113', 7,    7,    NULL, N'Inspection',               N'Standard',  N'in-progress', N'Fastener back-out survey on standing-seam Building B, per owner request.',                         NULL,                                          '2026-07-17T10:30:00', '2026-07-21', NULL,                  N'Ray Delgado',    NULL,     NULL,           NULL,                                                                                    9, 0, 3,   NULL),
 (N'WO-2026-114', 11,   12,   7,    N'Preventative Maintenance', N'Standard',  N'scheduled',   N'Semi-annual contract visit — Tech Center North: drains, seams, rooftop housekeeping.',             NULL,                                          '2026-07-16T08:00:00', '2026-07-28', NULL,                  N'Omar Sissoko',   NULL,     NULL,           NULL,                                                                                    0, 0, NULL, NULL),
 (N'WO-2026-115', 2,    3,    NULL, N'Repair',                   N'Standard',  N'new',         N'Replace damaged walk pads and re-secure lightning protection cable, upper bowl.',                  NULL,                                          '2026-07-19T10:05:00', NULL,         NULL,                  NULL,              9000.00,  N'PO-SKG-3319', NULL,                                                                                    0, 0, NULL, NULL),
 (N'WO-2026-116', NULL, NULL, NULL, N'Leak Call',                N'Standard',  N'new',         N'Water coming through ceiling tiles in our back office after sprinkler testing on the roof.' + NCHAR(10) + NCHAR(10) + N'Reported by: Tina Alvarez · 916-555-0472 · talvarez@example.com' + NCHAR(10) + N'Building: Riverside Office Annex', N'Back office, above copy room', '2026-07-21T16:50:00', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL);
GO

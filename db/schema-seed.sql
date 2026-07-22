/* ============================================================
   Kodiak CRM — Azure SQL Database schema + seed data
   Generated from crm/js/data.js (demo dataset); Leads seeds are
   independent samples (runtime rows come from POST /api/lead).
   Row counts: Accounts 12, Opportunities 20, Projects 5,
               Estimates 7, Activities 8, Leads 4
   ============================================================ */

-- ---- Drop children before parents -------------------------------------
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

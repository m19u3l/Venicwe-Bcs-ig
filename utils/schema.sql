-- ===================================
-- DROP TABLES IF THEY EXIST
-- ===================================
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS line_items;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS work_orders;
DROP TABLE IF EXISTS job_tracking;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS tools;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS estimates;
DROP TABLE IF EXISTS change_orders;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS remediation_dryout;
DROP TABLE IF EXISTS remediation_reconstruction;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS settings;

-- ===================================
-- Clients Table
-- ===================================
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT
);

-- ===================================
-- Services Table
-- ===================================
CREATE TABLE services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    description TEXT,
    base_price REAL
);

-- ===================================
-- Invoices Table
-- ===================================
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client INTEGER NOT NULL,
    date_created TEXT DEFAULT CURRENT_TIMESTAMP,
    total REAL DEFAULT 0,
    FOREIGN KEY (client) REFERENCES clients(id)
);

-- ===================================
-- Line Items Table (for invoices)
-- ===================================
CREATE TABLE line_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice INTEGER NOT NULL,
    service INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    total REAL DEFAULT 0,
    FOREIGN KEY (invoice) REFERENCES invoices(id),
    FOREIGN KEY (service) REFERENCES services(id)
);

-- ===================================
-- Employees Table
-- ===================================
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    hourly_rate REAL
);

-- ===================================
-- Work Orders Table
-- ===================================
CREATE TABLE work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client INTEGER NOT NULL,
    assigned_employee INTEGER,
    status TEXT DEFAULT 'Pending',
    date_created TEXT DEFAULT CURRENT_TIMESTAMP,
    date_completed TEXT,
    notes TEXT,
    FOREIGN KEY (client) REFERENCES clients(id),
    FOREIGN KEY (assigned_employee) REFERENCES employees(id)
);

-- ===================================
-- Job Tracking Table
-- ===================================
CREATE TABLE job_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_order INTEGER NOT NULL,
    step TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    date_started TEXT,
    date_finished TEXT,
    FOREIGN KEY (work_order) REFERENCES work_orders(id)
);

-- ===================================
-- Materials Table
-- ===================================
CREATE TABLE materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    unit_cost REAL DEFAULT 0,
    total_cost REAL GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    vendor INTEGER,
    store_link TEXT DEFAULT 'https://www.homedepot.com/',  -- link to Home Depot
    FOREIGN KEY (vendor) REFERENCES vendors(id)
);

-- ===================================
-- Equipment Table
-- ===================================
CREATE TABLE equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    purchase_date TEXT,
    cost REAL,
    status TEXT DEFAULT 'Available'
);

-- ===================================
-- Tools Table
-- ===================================
CREATE TABLE tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Available'
);

-- ===================================
-- Vendors / Subs Table
-- ===================================
CREATE TABLE vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT
);

-- ===================================
-- Estimates Table
-- ===================================
CREATE TABLE estimates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client INTEGER NOT NULL,
    date_created TEXT DEFAULT CURRENT_TIMESTAMP,
    total REAL DEFAULT 0,
    status TEXT DEFAULT 'Pending',
    FOREIGN KEY (client) REFERENCES clients(id)
);

-- ===================================
-- Change Orders Table
-- ===================================
CREATE TABLE change_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_order INTEGER NOT NULL,
    description TEXT,
    cost_change REAL DEFAULT 0,
    date_created TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Pending',
    FOREIGN KEY (work_order) REFERENCES work_orders(id)
);

-- ===================================
-- Attachments Table
-- ===================================
CREATE TABLE attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    related_table TEXT NOT NULL,
    related_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- Remediation Dry-Out Table
-- ===================================
CREATE TABLE remediation_dryout (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_order INTEGER NOT NULL,
    area TEXT NOT NULL,
    moisture_level REAL,
    equipment_used TEXT,
    date_started TEXT,
    date_completed TEXT,
    FOREIGN KEY (work_order) REFERENCES work_orders(id)
);

-- ===================================
-- Remediation Reconstruction Table
-- ===================================
CREATE TABLE remediation_reconstruction (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_order INTEGER NOT NULL,
    description TEXT,
    materials_used TEXT,
    labor_hours REAL,
    date_started TEXT,
    date_completed TEXT,
    FOREIGN KEY (work_order) REFERENCES work_orders(id)
);

-- ===================================
-- Reports Table
-- ===================================
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    report_type TEXT,
    generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    content TEXT
);

-- ===================================
-- Settings Table
-- ===================================
CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT
);


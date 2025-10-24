-- =========================
-- Clients
-- =========================
INSERT INTO clients (name, email, address) VALUES
('John Smith', 'john.smith@example.com', '123 Main St, San Diego, CA 92122'),
('Mary Johnson', 'mary.johnson@example.com', '456 Elm St, La Jolla, CA 92037'),
('Acme HOA', 'hoa@acme.com', '789 Oak St, San Diego, CA 92122');

-- =========================
-- Services
-- =========================
INSERT INTO services (category, description, base_price) VALUES
('Water Remediation', 'Extraction and drying of water-damaged areas', 250.00),
('Mold Remediation', 'Mold inspection and removal', 350.00),
('Bathroom Repair', 'Repair and replacement of fixtures', 85.00),
('Drywall Repair', 'Patch and paint drywall', 65.00),
('Flooring Replacement', 'Replace damaged flooring with laminate or tile', 120.00),
('Painting', 'Interior painting of rooms', 100.00),
('Plumbing Labor', 'Plumbing repair and installation', 90.00),
('Material Delivery', 'Delivery of construction or repair materials', 50.00);

-- =========================
-- Invoices
-- =========================
INSERT INTO invoices (client, date_created, total) VALUES
(1, '2025-10-01 10:00:00', 1000.00),
(2, '2025-10-05 14:30:00', 750.00),
(3, '2025-10-10 09:15:00', 2300.00);

-- =========================
-- Line Items
-- =========================
INSERT INTO line_items (invoice, service, quantity, total) VALUES
(1, 1, 2, 500.00),
(1, 4, 5, 325.00),
(1, 6, 1, 100.00),
(1, 8, 1, 75.00),
(2, 2, 1, 350.00),
(2, 3, 2, 170.00),
(2, 7, 2, 180.00),
(2, 8, 1, 50.00),
(3, 1, 3, 750.00),
(3, 2, 2, 700.00),
(3, 5, 5, 600.00),
(3, 6, 2, 200.00),
(3, 7, 3, 270.00);


-- =========================
-- Vendors
-- =========================
INSERT INTO vendors (name, contact) VALUES
('Home Depot', 'support@homedepot.com'),
('Lowe\'s', 'support@lowes.com');

-- =========================
-- Materials
-- =========================
INSERT INTO materials (name, quantity, unit_cost, vendor, store_link) VALUES
('Sheetrock', 10, 15.00, 1, 'https://www.homedepot.com/p/Sheetrock-Standard-Drywall'),
('2x4 Lumber', 20, 3.00, 1, 'https://www.homedepot.com/p/2x4-Lumber'),
('Joint Compound', 5, 10.00, 1, 'https://www.homedepot.com/p/Joint-Compound'),
('Paint - White', 10, 25.00, 1, 'https://www.homedepot.com/p/Behr-Paint-White'),
('Tile - Ceramic', 50, 2.50, 1, 'https://www.homedepot.com/p/Ceramic-Tile');



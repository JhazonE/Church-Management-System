-- Insert users (ignore duplicates)
INSERT IGNORE INTO users (id, name, username, role, password, permissions) VALUES
('u1', 'Admin User', 'admin', 'Admin', '$2a$10$rOKXVpToNIIZ4G6cXP8zouC8Z1nFgA5xwGhxZWgRc3EH8n9Fy1zW', '{"dashboard":true,"members":true,"events":true,"donations":true,"expenses":true,"reports":true,"users":true}'),
('u2', 'Staff User', 'staff', 'Staff', '$2a$10$rOKXVpToNIIZ4G6cXP8zouC8Z1nFgA5xwGhxZWgRc3EH8n9Fy1zW', '{"dashboard":false,"members":true,"events":true,"donations":true,"expenses":true,"reports":true,"users":false}');

-- Insert members (ignore duplicates)
INSERT IGNORE INTO members (id, name, email, phone, join_date, avatar_url, address, network) VALUES
('m1', 'John Doe', 'john.doe@example.com', '123-456-7890', '2020-01-15 00:00:00', NULL, '123 Main St, City, State', 'Main Campus'),
('m2', 'Jane Smith', 'jane.smith@example.com', '987-654-3210', '2019-08-20 00:00:00', NULL, '456 Oak Ave, City, State', 'North District'),
('m3', 'Bob Johnson', 'bob.johnson@example.com', '555-123-4567', '2021-03-10 00:00:00', NULL, '789 Pine St, City, State', 'Main Campus'),
('m4', 'Alice Brown', 'alice.brown@example.com', '444-567-8901', '2020-11-05 00:00:00', NULL, '321 Elm St, City, State', 'South District'),
('m5', 'Charlie Wilson', 'charlie.wilson@example.com', '333-678-9012', '2018-12-12 00:00:00', NULL, '654 Maple Dr, City, State', 'North District');

-- Insert donation categories (ignore duplicates)
INSERT IGNORE INTO donation_categories (id, name) VALUES
('tithe', 'Tithe'),
('offering', 'Offering'),
('special', 'Special Offering'),
('missions', 'Missions'),
('building', 'Building Fund'),
('benevolence', 'Benevolence'),
('other', 'Other');

-- Insert expense categories (ignore duplicates)
INSERT IGNORE INTO expense_categories (id, name) VALUES
('utilities', 'Utilities'),
('maintenance', 'Maintenance'),
('supplies', 'Office Supplies'),
('events', 'Events'),
('salaries', 'Staff Salaries'),
('insurance', 'Insurance'),
('other_exp', 'Other');

-- Insert service times (ignore duplicates)
INSERT IGNORE INTO service_times (id, time) VALUES
('morning', 'Morning Service'),
('afternoon', 'Afternoon Service'),
('evening', 'Evening Service');

-- Insert giving types (ignore duplicates)
INSERT IGNORE INTO giving_types (id, name) VALUES
('cash', 'Cash'),
('check', 'Check'),
('online', 'Online'),
('transfer', 'Bank Transfer');

-- Insert networks (ignore duplicates)
INSERT IGNORE INTO networks (id, name) VALUES
('main', 'Main Campus'),
('north', 'North District'),
('south', 'South District'),
('youth', 'Youth'),
('kids', 'Kids');

-- Insert events (ignore duplicates)
INSERT IGNORE INTO events (id, title, date, description, resource) VALUES
('e1', 'Sunday Worship', '2024-01-14 00:00:00', 'Regular Sunday morning service', 'Main Hall'),
('e2', 'Youth Group Meeting', '2024-01-15 00:00:00', 'Weekly youth group gathering', 'Community Room'),
('e3', 'Bible Study', '2024-01-16 00:00:00', 'Mid-week Bible study session', 'Chapel');

-- Insert donations
INSERT IGNORE INTO donations (id, donor_name, member_id, amount, date, category, giving_type_id, service_time, recorded_by_id, reference) VALUES
('d1', 'Anonymous', NULL, 100.00, '2024-01-07 00:00:00', 'Tithe', 'cash', 'Morning Service', 'u1', NULL),
('d2', 'John Doe', 'm1', 50.00, '2024-01-07 00:00:00', 'Offering', 'check', 'Morning Service', 'u1', 'CHK-1234'),
('d3', 'Jane Smith', 'm2', 75.00, '2024-01-07 00:00:00', 'Tithe', 'online', 'Afternoon Service', 'u1', NULL),
('d4', 'Bob Johnson', 'm3', 200.00, '2024-01-14 00:00:00', 'Missions', 'transfer', 'Morning Service', 'u2', 'WIRE-123'),
('d5', 'Alice Brown', 'm4', 25.00, '2024-01-14 00:00:00', 'Offering', 'cash', 'Morning Service', 'u2', NULL),
('d6', 'Charlie Wilson', 'm5', 150.00, '2024-01-14 00:00:00', 'Building Fund', 'online', 'Afternoon Service', 'u2', 'ONLINE-456'),
('d7', 'Anonymous', NULL, 300.00, '2024-01-21 00:00:00', 'Special Offering', 'check', 'Evening Service', 'u1', 'CHK-5678'),
('d8', 'Jane Smith', 'm2', 50.00, '2024-01-21 00:00:00', 'Tithe', 'cash', 'Evening Service', 'u1', NULL),
('d9', 'Bob Johnson', 'm3', 100.00, '2024-01-21 00:00:00', 'Benevolence', 'online', 'Evening Service', 'u2', NULL),
('d10', 'Alice Brown', 'm4', 40.00, '2024-01-21 00:00:00', 'Offering', 'transfer', 'Evening Service', 'u2', NULL);

-- Insert expenses
INSERT IGNORE INTO expenses (id, description, amount, date, category, recorded_by_id) VALUES
('ex1', 'Electricity Bill', 250.00, '2024-01-01 00:00:00', 'Utilities', 'u1'),
('ex2', 'Water Bill', 75.00, '2024-01-01 00:00:00', 'Utilities', 'u1'),
('ex3', 'Office Supplies', 150.00, '2024-01-05 00:00:00', 'Office Supplies', 'u2'),
('ex4', 'Janitorial Service', 200.00, '2024-01-10 00:00:00', 'Maintenance', 'u1'),
('ex5', 'Youth Event Food', 300.00, '2024-01-12 00:00:00', 'Events', 'u2'),
('ex6', 'Insurance Premium', 500.00, '2024-01-15 00:00:00', 'Insurance', 'u1'),
('ex7', 'Phone Bill', 100.00, '2024-01-20 00:00:00', 'Utilities', 'u2'),
('ex8', 'Sound System Repair', 400.00, '2024-01-25 00:00:00', 'Maintenance', 'u1');

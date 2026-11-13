CREATE TABLE IF NOT EXISTS roles (
  role_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id INT UNSIGNED NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender ENUM('Male','Female','Other') NULL,
  phone VARCHAR(20) NULL,
  email VARCHAR(150) NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS camp_zones (
  zone_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  zone_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shelters (
  shelter_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  zone_id INT UNSIGNED NOT NULL,
  shelter_number VARCHAR(50) NOT NULL,
  capacity INT UNSIGNED NOT NULL,
  status ENUM('Available','Occupied','Maintenance') NOT NULL DEFAULT 'Available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_shelter_zone_number (zone_id, shelter_number),
  CONSTRAINT fk_shelters_zone FOREIGN KEY (zone_id) REFERENCES camp_zones(zone_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS families (
  family_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_code VARCHAR(30) NOT NULL UNIQUE,
  head_name VARCHAR(200) NOT NULL,
  family_size INT UNSIGNED NOT NULL DEFAULT 1,
  zone_id INT UNSIGNED NULL,
  shelter_id INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_families_zone FOREIGN KEY (zone_id) REFERENCES camp_zones(zone_id),
  CONSTRAINT fk_families_shelter FOREIGN KEY (shelter_id) REFERENCES shelters(shelter_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refugees (
  refugee_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  refugee_code VARCHAR(30) NOT NULL UNIQUE,
  family_id INT UNSIGNED NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender ENUM('Male','Female','Other') NULL,
  date_of_birth DATE NULL,
  nationality VARCHAR(100) NULL,
  country_of_origin VARCHAR(100) NULL,
  arrival_date DATE NOT NULL,
  phone VARCHAR(20) NULL,
  special_needs TEXT NULL,
  status ENUM('Active','Transferred','Returned') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_refugees_family (family_id),
  KEY idx_refugees_name (last_name, first_name),
  CONSTRAINT fk_refugees_family FOREIGN KEY (family_id) REFERENCES families(family_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resource_categories (
  category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resources (
  resource_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  resource_name VARCHAR(150) NOT NULL UNIQUE,
  unit VARCHAR(50) NOT NULL,
  minimum_stock DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_resources_category FOREIGN KEY (category_id) REFERENCES resource_categories(category_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS donors (
  donor_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donor_name VARCHAR(200) NOT NULL,
  donor_type ENUM('NGO','Government','Private','International','Individual') NOT NULL,
  contact_person VARCHAR(150) NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  address TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS donations (
  donation_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donor_id INT UNSIGNED NOT NULL,
  received_by INT UNSIGNED NOT NULL,
  donation_date DATE NOT NULL,
  remarks TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_donations_date (donation_date),
  CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id) REFERENCES donors(donor_id),
  CONSTRAINT fk_donations_user FOREIGN KEY (received_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS donation_details (
  donation_detail_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donation_id INT UNSIGNED NOT NULL,
  resource_id INT UNSIGNED NOT NULL,
  quantity DECIMAL(12,2) UNSIGNED NOT NULL,
  unit_cost DECIMAL(12,2) UNSIGNED NULL,
  UNIQUE KEY uq_donation_resource (donation_id, resource_id),
  CONSTRAINT fk_donation_details_donation FOREIGN KEY (donation_id) REFERENCES donations(donation_id) ON DELETE CASCADE,
  CONSTRAINT fk_donation_details_resource FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inventory (
  inventory_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  resource_id INT UNSIGNED NOT NULL UNIQUE,
  quantity_available DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_resource FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resource_requests (
  request_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  refugee_id INT UNSIGNED NOT NULL,
  requested_by INT UNSIGNED NOT NULL,
  reviewed_by INT UNSIGNED NULL,
  request_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending','Approved','Rejected','Completed') NOT NULL DEFAULT 'Pending',
  remarks TEXT NULL,
  reviewed_at DATETIME NULL,
  KEY idx_requests_status_date (status, request_date),
  CONSTRAINT fk_requests_refugee FOREIGN KEY (refugee_id) REFERENCES refugees(refugee_id),
  CONSTRAINT fk_requests_requester FOREIGN KEY (requested_by) REFERENCES users(user_id),
  CONSTRAINT fk_requests_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resource_request_details (
  request_detail_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id INT UNSIGNED NOT NULL,
  resource_id INT UNSIGNED NOT NULL,
  quantity DECIMAL(12,2) UNSIGNED NOT NULL,
  UNIQUE KEY uq_request_resource (request_id, resource_id),
  CONSTRAINT fk_request_details_request FOREIGN KEY (request_id) REFERENCES resource_requests(request_id) ON DELETE CASCADE,
  CONSTRAINT fk_request_details_resource FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS distributions (
  distribution_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  refugee_id INT UNSIGNED NOT NULL,
  request_id INT UNSIGNED NULL UNIQUE,
  distributed_by INT UNSIGNED NOT NULL,
  distribution_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_distributions_date (distribution_date),
  CONSTRAINT fk_distributions_refugee FOREIGN KEY (refugee_id) REFERENCES refugees(refugee_id),
  CONSTRAINT fk_distributions_request FOREIGN KEY (request_id) REFERENCES resource_requests(request_id),
  CONSTRAINT fk_distributions_user FOREIGN KEY (distributed_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS distribution_details (
  distribution_detail_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  distribution_id INT UNSIGNED NOT NULL,
  resource_id INT UNSIGNED NOT NULL,
  quantity DECIMAL(12,2) UNSIGNED NOT NULL,
  UNIQUE KEY uq_distribution_resource (distribution_id, resource_id),
  CONSTRAINT fk_distribution_details_distribution FOREIGN KEY (distribution_id) REFERENCES distributions(distribution_id) ON DELETE CASCADE,
  CONSTRAINT fk_distribution_details_resource FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stock_movements (
  movement_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  resource_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NULL,
  movement_type ENUM('Donation','Distribution','Adjustment') NOT NULL,
  quantity_change DECIMAL(12,2) NOT NULL,
  reference_id INT UNSIGNED NULL,
  reason VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_movements_resource_date (resource_id, created_at),
  CONSTRAINT fk_movements_resource FOREIGN KEY (resource_id) REFERENCES resources(resource_id),
  CONSTRAINT fk_movements_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  notification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notifications_user_read (user_id, is_read, created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id INT UNSIGNED NULL,
  details JSON NULL,
  action_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_date (action_date),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (role_name) VALUES
  ('Administrator'), ('Manager'), ('Volunteer'), ('Donor'), ('Refugee'), ('Warehouse Officer');

INSERT IGNORE INTO resource_categories (category_name) VALUES
  ('Food'), ('Medicine'), ('Clothing'), ('Water'), ('Shelter'), ('Hygiene');

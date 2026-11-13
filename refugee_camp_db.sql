-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 10, 2026 at 03:44 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `refugee_camp_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `log_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` int(10) UNSIGNED DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `action_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`log_id`, `user_id`, `action`, `table_name`, `record_id`, `details`, `action_date`) VALUES
(1, 1, 'LOGIN', 'users', 1, NULL, '2026-06-28 17:22:28'),
(2, 1, 'LOGIN', 'users', 1, NULL, '2026-06-28 17:26:21'),
(3, 1, 'LOGIN', 'users', 1, NULL, '2026-06-30 16:18:08'),
(4, 1, 'CREATE', 'camp_zones', 1, '{\"zone_name\":\"Mahama\",\"description\":\"Done\"}', '2026-06-30 16:20:34'),
(5, 1, 'CREATE', 'shelters', 1, '{\"zone_id\":\"1\",\"shelter_number\":\"SHET005\",\"capacity\":1,\"status\":\"Available\"}', '2026-06-30 16:20:46'),
(6, 1, 'CREATE', 'families', 2, '{\"family_code\":\"REF397\",\"head_name\":\"John\",\"family_size\":1,\"zone_id\":\"1\",\"shelter_id\":\"1\"}', '2026-06-30 16:21:10'),
(7, 1, 'CREATE', 'refugees', 1, '{\"refugee_code\":\"REF995\",\"family_id\":\"2\",\"first_name\":\"Imanishimwe\",\"last_name\":\"Noel\",\"gender\":\"Male\",\"date_of_birth\":\"2026-06-22\",\"nationality\":\"Burundi\",\"country_of_origin\":\"Rwanda\",\"arrival_date\":\"2026-06-30\",\"phone\":\"0784214450\",\"special_needs\":\"Tent\",\"status\":\"Active\"}', '2026-06-30 16:22:16'),
(8, 1, 'CREATE', 'donors', 1, '{\"donor_name\":\"Nalbina\'s Initiative\",\"donor_type\":\"NGO\",\"contact_person\":\"Imanishimwe Noel\",\"phone\":\"0784214450\",\"email\":\"imanishimwe002@gmail.com\",\"address\":\"KK515st\"}', '2026-06-30 16:24:04'),
(9, 1, 'CREATE', 'resources', 1, '{\"category_id\":\"3\",\"resource_name\":\"Pants\",\"unit\":\"none\",\"minimum_stock\":\"100\",\"description\":\"For Men\"}', '2026-06-30 16:25:29'),
(10, 1, 'RECEIVE_DONATION', 'donations', 1, NULL, '2026-06-30 16:26:07'),
(11, 1, 'LOGIN', 'users', 1, NULL, '2026-07-06 10:16:17'),
(12, 1, 'CREATE', 'users', 2, NULL, '2026-07-06 10:18:39'),
(13, 2, 'LOGIN', 'users', 2, NULL, '2026-07-06 10:23:48'),
(14, 1, 'LOGIN', 'users', 1, NULL, '2026-07-09 11:11:11'),
(15, 1, 'CREATE', 'families', 3, '{\"family_code\":\"75635\",\"head_name\":\"Peter\",\"family_size\":1,\"zone_id\":\"1\",\"shelter_id\":\"1\"}', '2026-07-09 11:13:40'),
(16, 1, 'DISTRIBUTE_RESOURCES', 'distributions', 1, NULL, '2026-07-09 11:16:59'),
(17, 1, 'LOGIN', 'users', 1, NULL, '2026-07-09 11:19:19'),
(18, 1, 'LOGIN', 'users', 1, NULL, '2026-07-09 11:20:28'),
(19, 1, 'CREATE', 'users', 3, NULL, '2026-07-09 11:21:12'),
(20, 3, 'LOGIN', 'users', 3, NULL, '2026-07-09 11:21:32'),
(21, 3, 'CREATE', 'resource_requests', 1, NULL, '2026-07-09 11:22:02'),
(22, 1, 'LOGIN', 'users', 1, NULL, '2026-07-09 11:22:44'),
(23, 1, 'REQUEST_APPROVED', 'resource_requests', 1, NULL, '2026-07-09 11:23:04'),
(24, 1, 'CREATE', 'users', 5, NULL, '2026-07-09 11:24:29'),
(25, 5, 'LOGIN', 'users', 5, NULL, '2026-07-09 11:24:42');

-- --------------------------------------------------------

--
-- Table structure for table `camp_zones`
--

CREATE TABLE `camp_zones` (
  `zone_id` int(10) UNSIGNED NOT NULL,
  `zone_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `camp_zones`
--

INSERT INTO `camp_zones` (`zone_id`, `zone_name`, `description`, `created_at`) VALUES
(1, 'Mahama', 'Done', '2026-06-30 16:20:34');

-- --------------------------------------------------------

--
-- Table structure for table `distributions`
--

CREATE TABLE `distributions` (
  `distribution_id` int(10) UNSIGNED NOT NULL,
  `refugee_id` int(10) UNSIGNED NOT NULL,
  `request_id` int(10) UNSIGNED DEFAULT NULL,
  `distributed_by` int(10) UNSIGNED NOT NULL,
  `distribution_date` datetime NOT NULL DEFAULT current_timestamp(),
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `distributions`
--

INSERT INTO `distributions` (`distribution_id`, `refugee_id`, `request_id`, `distributed_by`, `distribution_date`, `remarks`, `created_at`) VALUES
(1, 1, NULL, 1, '2026-07-09 13:16:59', 'Done', '2026-07-09 11:16:59');

-- --------------------------------------------------------

--
-- Table structure for table `distribution_details`
--

CREATE TABLE `distribution_details` (
  `distribution_detail_id` int(10) UNSIGNED NOT NULL,
  `distribution_id` int(10) UNSIGNED NOT NULL,
  `resource_id` int(10) UNSIGNED NOT NULL,
  `quantity` decimal(12,2) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `distribution_details`
--

INSERT INTO `distribution_details` (`distribution_detail_id`, `distribution_id`, `resource_id`, `quantity`) VALUES
(1, 1, 1, 1.00);

-- --------------------------------------------------------

--
-- Table structure for table `donations`
--

CREATE TABLE `donations` (
  `donation_id` int(10) UNSIGNED NOT NULL,
  `donor_id` int(10) UNSIGNED NOT NULL,
  `received_by` int(10) UNSIGNED NOT NULL,
  `donation_date` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `donations`
--

INSERT INTO `donations` (`donation_id`, `donor_id`, `received_by`, `donation_date`, `remarks`, `created_at`) VALUES
(1, 1, 1, '2026-06-30', 'Well Done', '2026-06-30 16:26:07');

-- --------------------------------------------------------

--
-- Table structure for table `donation_details`
--

CREATE TABLE `donation_details` (
  `donation_detail_id` int(10) UNSIGNED NOT NULL,
  `donation_id` int(10) UNSIGNED NOT NULL,
  `resource_id` int(10) UNSIGNED NOT NULL,
  `quantity` decimal(12,2) UNSIGNED NOT NULL,
  `unit_cost` decimal(12,2) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `donation_details`
--

INSERT INTO `donation_details` (`donation_detail_id`, `donation_id`, `resource_id`, `quantity`, `unit_cost`) VALUES
(1, 1, 1, 1.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `donors`
--

CREATE TABLE `donors` (
  `donor_id` int(10) UNSIGNED NOT NULL,
  `donor_name` varchar(200) NOT NULL,
  `donor_type` enum('NGO','Government','Private','International','Individual') NOT NULL,
  `contact_person` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `donors`
--

INSERT INTO `donors` (`donor_id`, `donor_name`, `donor_type`, `contact_person`, `phone`, `email`, `address`, `created_at`) VALUES
(1, 'Nalbina\'s Initiative', 'NGO', 'Imanishimwe Noel', '0784214450', 'imanishimwe002@gmail.com', 'KK515st', '2026-06-30 16:24:04');

-- --------------------------------------------------------

--
-- Table structure for table `families`
--

CREATE TABLE `families` (
  `family_id` int(10) UNSIGNED NOT NULL,
  `family_code` varchar(30) NOT NULL,
  `head_name` varchar(200) NOT NULL,
  `family_size` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `zone_id` int(10) UNSIGNED DEFAULT NULL,
  `shelter_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `families`
--

INSERT INTO `families` (`family_id`, `family_code`, `head_name`, `family_size`, `zone_id`, `shelter_id`, `created_at`) VALUES
(2, 'REF397', 'John', 1, 1, 1, '2026-06-30 16:21:10'),
(3, '75635', 'Peter', 1, 1, 1, '2026-07-09 11:13:40');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `inventory_id` int(10) UNSIGNED NOT NULL,
  `resource_id` int(10) UNSIGNED NOT NULL,
  `quantity_available` decimal(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`inventory_id`, `resource_id`, `quantity_available`, `last_updated`) VALUES
(1, 1, 0.00, '2026-07-09 11:16:59');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 1, 'Low stock alert', 'Pants is at or below minimum stock', 1, '2026-07-09 11:16:59');

-- --------------------------------------------------------

--
-- Table structure for table `refugees`
--

CREATE TABLE `refugees` (
  `refugee_id` int(10) UNSIGNED NOT NULL,
  `refugee_code` varchar(30) NOT NULL,
  `family_id` int(10) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `country_of_origin` varchar(100) DEFAULT NULL,
  `arrival_date` date NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `special_needs` text DEFAULT NULL,
  `status` enum('Active','Transferred','Returned') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `refugees`
--

INSERT INTO `refugees` (`refugee_id`, `refugee_code`, `family_id`, `first_name`, `last_name`, `gender`, `date_of_birth`, `nationality`, `country_of_origin`, `arrival_date`, `phone`, `special_needs`, `status`, `created_at`, `updated_at`) VALUES
(1, 'REF995', 2, 'Imanishimwe', 'Noel', 'Male', '2026-06-22', 'Burundi', 'Rwanda', '2026-06-30', '0784214450', 'Tent', 'Active', '2026-06-30 16:22:16', '2026-06-30 16:22:16');

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

CREATE TABLE `resources` (
  `resource_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `resource_name` varchar(150) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `minimum_stock` decimal(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resources`
--

INSERT INTO `resources` (`resource_id`, `category_id`, `resource_name`, `unit`, `minimum_stock`, `description`, `is_active`) VALUES
(1, 3, 'Pants', 'none', 100.00, 'For Men', 1);

-- --------------------------------------------------------

--
-- Table structure for table `resource_categories`
--

CREATE TABLE `resource_categories` (
  `category_id` int(10) UNSIGNED NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resource_categories`
--

INSERT INTO `resource_categories` (`category_id`, `category_name`, `description`) VALUES
(1, 'Food', NULL),
(2, 'Medicine', NULL),
(3, 'Clothing', NULL),
(4, 'Water', NULL),
(5, 'Shelter', NULL),
(6, 'Hygiene', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `resource_requests`
--

CREATE TABLE `resource_requests` (
  `request_id` int(10) UNSIGNED NOT NULL,
  `refugee_id` int(10) UNSIGNED NOT NULL,
  `requested_by` int(10) UNSIGNED NOT NULL,
  `reviewed_by` int(10) UNSIGNED DEFAULT NULL,
  `request_date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('Pending','Approved','Rejected','Completed') NOT NULL DEFAULT 'Pending',
  `remarks` text DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resource_requests`
--

INSERT INTO `resource_requests` (`request_id`, `refugee_id`, `requested_by`, `reviewed_by`, `request_date`, `status`, `remarks`, `reviewed_at`) VALUES
(1, 1, 3, 1, '2026-07-09 13:22:02', 'Approved', 'Well', '2026-07-09 13:23:04');

-- --------------------------------------------------------

--
-- Table structure for table `resource_request_details`
--

CREATE TABLE `resource_request_details` (
  `request_detail_id` int(10) UNSIGNED NOT NULL,
  `request_id` int(10) UNSIGNED NOT NULL,
  `resource_id` int(10) UNSIGNED NOT NULL,
  `quantity` decimal(12,2) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resource_request_details`
--

INSERT INTO `resource_request_details` (`request_detail_id`, `request_id`, `resource_id`, `quantity`) VALUES
(1, 1, 1, 5.00);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(10) UNSIGNED NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'Administrator'),
(2, 'Camp Manager'),
(6, 'Donor'),
(5, 'Manager'),
(7, 'Refugee'),
(3, 'Volunteer'),
(4, 'Warehouse Officer');

-- --------------------------------------------------------

--
-- Table structure for table `schema_migrations`
--

CREATE TABLE `schema_migrations` (
  `migration_name` varchar(255) NOT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schema_migrations`
--

INSERT INTO `schema_migrations` (`migration_name`, `applied_at`) VALUES
('001_initial_schema.sql', '2026-06-28 16:56:16');

-- --------------------------------------------------------

--
-- Table structure for table `shelters`
--

CREATE TABLE `shelters` (
  `shelter_id` int(10) UNSIGNED NOT NULL,
  `zone_id` int(10) UNSIGNED NOT NULL,
  `shelter_number` varchar(50) NOT NULL,
  `capacity` int(10) UNSIGNED NOT NULL,
  `status` enum('Available','Occupied','Maintenance') NOT NULL DEFAULT 'Available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shelters`
--

INSERT INTO `shelters` (`shelter_id`, `zone_id`, `shelter_number`, `capacity`, `status`, `created_at`) VALUES
(1, 1, 'SHET005', 1, 'Available', '2026-06-30 16:20:46');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `movement_id` bigint(20) UNSIGNED NOT NULL,
  `resource_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `movement_type` enum('Donation','Distribution','Adjustment') NOT NULL,
  `quantity_change` decimal(12,2) NOT NULL,
  `reference_id` int(10) UNSIGNED DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`movement_id`, `resource_id`, `user_id`, `movement_type`, `quantity_change`, `reference_id`, `reason`, `created_at`) VALUES
(1, 1, 1, 'Donation', 1.00, 1, NULL, '2026-06-30 16:26:07'),
(2, 1, 1, 'Distribution', -1.00, 1, NULL, '2026-07-09 11:16:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `role_id`, `first_name`, `last_name`, `gender`, `phone`, `email`, `username`, `password_hash`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'System', 'Administrator', NULL, NULL, 'admin@example.com', 'admin', '$2b$12$DYxqCVIap.vxFOB8wd0ifefFb1Rc8DVHh0IXUlyUolDX5igKUftMK', 'Active', '2026-06-28 16:56:26', '2026-07-06 10:14:46'),
(2, 3, 'Peter', 'Johnson', NULL, '0784214450', 'pjohn@gmail.com', 'pjohn', '$2b$12$iVMFaWZm3Hs3fY7cFJbphOaRrEWyy7MbKH3G1BGPvefNpMPyMAxGS', 'Active', '2026-07-06 10:18:39', '2026-07-06 10:18:39'),
(3, 3, 'deo', 'john', 'Male', '0784214450', 'noel2002imanishimwe@gmail.com', 'deo', '$2b$12$W5AZEdpowCDrxnD5ESRJme/qVHJFp32Kk3I0uFGTHCOxuzMbFnegq', 'Active', '2026-07-09 11:21:12', '2026-07-09 11:21:12'),
(5, 6, 'donor', 'We', NULL, '0784214450', 'noel2002imanishmwe@gmail.com', 'donor', '$2b$12$A4kW1Cn30MYhMzkcWUjyrOhA9lVcODcsH99Q0/Ijxg1iqGoc.i3r.', 'Active', '2026-07-09 11:24:29', '2026-07-09 11:24:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_audit_date` (`action_date`),
  ADD KEY `fk_audit_user` (`user_id`);

--
-- Indexes for table `camp_zones`
--
ALTER TABLE `camp_zones`
  ADD PRIMARY KEY (`zone_id`),
  ADD UNIQUE KEY `zone_name` (`zone_name`);

--
-- Indexes for table `distributions`
--
ALTER TABLE `distributions`
  ADD PRIMARY KEY (`distribution_id`),
  ADD UNIQUE KEY `request_id` (`request_id`),
  ADD KEY `idx_distributions_date` (`distribution_date`),
  ADD KEY `fk_distributions_refugee` (`refugee_id`),
  ADD KEY `fk_distributions_user` (`distributed_by`);

--
-- Indexes for table `distribution_details`
--
ALTER TABLE `distribution_details`
  ADD PRIMARY KEY (`distribution_detail_id`),
  ADD UNIQUE KEY `uq_distribution_resource` (`distribution_id`,`resource_id`),
  ADD KEY `fk_distribution_details_resource` (`resource_id`);

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`donation_id`),
  ADD KEY `idx_donations_date` (`donation_date`),
  ADD KEY `fk_donations_donor` (`donor_id`),
  ADD KEY `fk_donations_user` (`received_by`);

--
-- Indexes for table `donation_details`
--
ALTER TABLE `donation_details`
  ADD PRIMARY KEY (`donation_detail_id`),
  ADD UNIQUE KEY `uq_donation_resource` (`donation_id`,`resource_id`),
  ADD KEY `fk_donation_details_resource` (`resource_id`);

--
-- Indexes for table `donors`
--
ALTER TABLE `donors`
  ADD PRIMARY KEY (`donor_id`);

--
-- Indexes for table `families`
--
ALTER TABLE `families`
  ADD PRIMARY KEY (`family_id`),
  ADD UNIQUE KEY `family_code` (`family_code`),
  ADD KEY `fk_families_zone` (`zone_id`),
  ADD KEY `fk_families_shelter` (`shelter_id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`inventory_id`),
  ADD UNIQUE KEY `resource_id` (`resource_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_notifications_user_read` (`user_id`,`is_read`,`created_at`);

--
-- Indexes for table `refugees`
--
ALTER TABLE `refugees`
  ADD PRIMARY KEY (`refugee_id`),
  ADD UNIQUE KEY `refugee_code` (`refugee_code`),
  ADD KEY `idx_refugees_family` (`family_id`),
  ADD KEY `idx_refugees_name` (`last_name`,`first_name`);

--
-- Indexes for table `resources`
--
ALTER TABLE `resources`
  ADD PRIMARY KEY (`resource_id`),
  ADD UNIQUE KEY `resource_name` (`resource_name`),
  ADD KEY `fk_resources_category` (`category_id`);

--
-- Indexes for table `resource_categories`
--
ALTER TABLE `resource_categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- Indexes for table `resource_requests`
--
ALTER TABLE `resource_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_requests_status_date` (`status`,`request_date`),
  ADD KEY `fk_requests_refugee` (`refugee_id`),
  ADD KEY `fk_requests_requester` (`requested_by`),
  ADD KEY `fk_requests_reviewer` (`reviewed_by`);

--
-- Indexes for table `resource_request_details`
--
ALTER TABLE `resource_request_details`
  ADD PRIMARY KEY (`request_detail_id`),
  ADD UNIQUE KEY `uq_request_resource` (`request_id`,`resource_id`),
  ADD KEY `fk_request_details_resource` (`resource_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  ADD PRIMARY KEY (`migration_name`);

--
-- Indexes for table `shelters`
--
ALTER TABLE `shelters`
  ADD PRIMARY KEY (`shelter_id`),
  ADD UNIQUE KEY `uq_shelter_zone_number` (`zone_id`,`shelter_number`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`movement_id`),
  ADD KEY `idx_movements_resource_date` (`resource_id`,`created_at`),
  ADD KEY `fk_movements_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_role` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `log_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `camp_zones`
--
ALTER TABLE `camp_zones`
  MODIFY `zone_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `distributions`
--
ALTER TABLE `distributions`
  MODIFY `distribution_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `distribution_details`
--
ALTER TABLE `distribution_details`
  MODIFY `distribution_detail_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `donations`
--
ALTER TABLE `donations`
  MODIFY `donation_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `donation_details`
--
ALTER TABLE `donation_details`
  MODIFY `donation_detail_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `donors`
--
ALTER TABLE `donors`
  MODIFY `donor_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `families`
--
ALTER TABLE `families`
  MODIFY `family_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `inventory_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `refugees`
--
ALTER TABLE `refugees`
  MODIFY `refugee_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `resources`
--
ALTER TABLE `resources`
  MODIFY `resource_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `resource_categories`
--
ALTER TABLE `resource_categories`
  MODIFY `category_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `resource_requests`
--
ALTER TABLE `resource_requests`
  MODIFY `request_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `resource_request_details`
--
ALTER TABLE `resource_request_details`
  MODIFY `request_detail_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `shelters`
--
ALTER TABLE `shelters`
  MODIFY `shelter_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `movement_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `distributions`
--
ALTER TABLE `distributions`
  ADD CONSTRAINT `fk_distributions_refugee` FOREIGN KEY (`refugee_id`) REFERENCES `refugees` (`refugee_id`),
  ADD CONSTRAINT `fk_distributions_request` FOREIGN KEY (`request_id`) REFERENCES `resource_requests` (`request_id`),
  ADD CONSTRAINT `fk_distributions_user` FOREIGN KEY (`distributed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `distribution_details`
--
ALTER TABLE `distribution_details`
  ADD CONSTRAINT `fk_distribution_details_distribution` FOREIGN KEY (`distribution_id`) REFERENCES `distributions` (`distribution_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_distribution_details_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`);

--
-- Constraints for table `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `fk_donations_donor` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`donor_id`),
  ADD CONSTRAINT `fk_donations_user` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `donation_details`
--
ALTER TABLE `donation_details`
  ADD CONSTRAINT `fk_donation_details_donation` FOREIGN KEY (`donation_id`) REFERENCES `donations` (`donation_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_donation_details_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`);

--
-- Constraints for table `families`
--
ALTER TABLE `families`
  ADD CONSTRAINT `fk_families_shelter` FOREIGN KEY (`shelter_id`) REFERENCES `shelters` (`shelter_id`),
  ADD CONSTRAINT `fk_families_zone` FOREIGN KEY (`zone_id`) REFERENCES `camp_zones` (`zone_id`);

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `fk_inventory_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `refugees`
--
ALTER TABLE `refugees`
  ADD CONSTRAINT `fk_refugees_family` FOREIGN KEY (`family_id`) REFERENCES `families` (`family_id`);

--
-- Constraints for table `resources`
--
ALTER TABLE `resources`
  ADD CONSTRAINT `fk_resources_category` FOREIGN KEY (`category_id`) REFERENCES `resource_categories` (`category_id`);

--
-- Constraints for table `resource_requests`
--
ALTER TABLE `resource_requests`
  ADD CONSTRAINT `fk_requests_refugee` FOREIGN KEY (`refugee_id`) REFERENCES `refugees` (`refugee_id`),
  ADD CONSTRAINT `fk_requests_requester` FOREIGN KEY (`requested_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_requests_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `resource_request_details`
--
ALTER TABLE `resource_request_details`
  ADD CONSTRAINT `fk_request_details_request` FOREIGN KEY (`request_id`) REFERENCES `resource_requests` (`request_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_request_details_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`);

--
-- Constraints for table `shelters`
--
ALTER TABLE `shelters`
  ADD CONSTRAINT `fk_shelters_zone` FOREIGN KEY (`zone_id`) REFERENCES `camp_zones` (`zone_id`);

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `fk_movements_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`),
  ADD CONSTRAINT `fk_movements_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

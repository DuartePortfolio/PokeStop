-- ============================================
-- POKESTOP APPLICATION DATABASE INITIALIZATION
-- ============================================
-- This file initializes all MySQL databases required by PokeStop services
-- Each service has its own database with proper schema and sample data

-- ============================================
-- 1. AUTHENTICATION SERVICE DATABASE
-- ============================================
-- Database: pokestop_auth_db
-- Purpose: JWT refresh tokens, password reset tokens, security tracking

CREATE DATABASE IF NOT EXISTS pokestop_auth_db;
USE pokestop_auth_db;

-- Refresh tokens for JWT token rotation and session management
CREATE TABLE IF NOT EXISTS RefreshTokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL COMMENT 'Reference to Users.id from user-service',
    token VARCHAR(500) NOT NULL UNIQUE,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revokedAt DATETIME NULL COMMENT 'Set when token is revoked/invalidated',
    ipAddress VARCHAR(45) NULL,
    userAgent VARCHAR(500) NULL,
    
    INDEX idx_token (token),
    INDEX idx_user (userId),
    INDEX idx_expires (expiresAt),
    INDEX idx_active (userId, revokedAt, expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset tokens
CREATE TABLE IF NOT EXISTS PasswordResetTokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL COMMENT 'Reference to Users.id from user-service',
    token VARCHAR(255) NOT NULL UNIQUE,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usedAt DATETIME NULL COMMENT 'Set when token is used to reset password',
    
    INDEX idx_token (token),
    INDEX idx_user (userId),
    INDEX idx_expires (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login attempts for rate limiting and security monitoring
CREATE TABLE IF NOT EXISTS LoginAttempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    ipAddress VARCHAR(45) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    failureReason VARCHAR(100) NULL,
    attemptedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_username (username, attemptedAt),
    INDEX idx_ip (ipAddress, attemptedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. USER SERVICE DATABASE
-- ============================================
-- Database: pokestop_users_db
-- Purpose: User profiles, authentication, user metadata

CREATE DATABASE IF NOT EXISTS pokestop_users_db;
USE pokestop_users_db;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  displayName VARCHAR(255) NOT NULL,
  avatar VARCHAR(512) DEFAULT NULL,
  bio TEXT,
  badges JSON DEFAULT NULL,
  stats JSON DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  role VARCHAR(32) NOT NULL DEFAULT 'user',
  PRIMARY KEY (id),
  UNIQUE KEY username (username)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Sample test user
INSERT INTO users VALUES (1,'testuser','$2b$10$F.V/RtjGWdaySy7CXJwy5eGPW7qvJVK1adPdfX3/yUio8v0m00wDa','Test User',NULL,NULL,NULL,NULL,'2026-01-07 17:27:27','2026-01-07 17:27:27','user');

-- ============================================
-- 3. ENCOUNTER SERVICE DATABASE
-- ============================================
-- Database: pokestop_encounter_db
-- Purpose: Pokemon encounters, minigame attempts, capture mechanics

CREATE DATABASE IF NOT EXISTS pokestop_encounter_db;
USE pokestop_encounter_db;

-- Wild Pokemon encounters
CREATE TABLE IF NOT EXISTS Encounters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL COMMENT 'Reference to Users.id from user-service',
    pokemonId INT NOT NULL COMMENT 'Pokedex number of encountered Pokemon',
    pokemonName VARCHAR(100) NOT NULL,
    pokemonSprite VARCHAR(255),
    captureRate INT DEFAULT 45,
    
    -- Basic spawn data
    isShiny BOOLEAN DEFAULT FALSE,
    
    -- Encounter status
    status ENUM('active', 'caught', 'fled', 'skipped') NOT NULL DEFAULT 'active',
    maxAttempts INT NOT NULL DEFAULT 3,
    attemptsUsed INT NOT NULL DEFAULT 0,
    nickname VARCHAR(50) NULL,
    
    -- Timing
    encounteredAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completedAt DATETIME NULL,
    
    INDEX idx_user (userId),
    INDEX idx_pokemon (pokemonId),
    INDEX idx_status (status),
    INDEX idx_active (userId, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Minigame attempts
CREATE TABLE IF NOT EXISTS MinigameAttempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    encounterId INT NOT NULL,
    attemptNumber INT NOT NULL COMMENT '1, 2, 3',
    
    -- Simple performance metric
    score INT DEFAULT 0,
    
    -- Result
    success BOOLEAN NOT NULL DEFAULT FALSE,
    
    attemptedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (encounterId) REFERENCES Encounters(id) ON DELETE CASCADE,
    INDEX idx_encounter (encounterId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TEAM SERVICE DATABASE (PLACEHOLDER)
-- ============================================
-- Database: pokestop_teams_db
-- Purpose: Pokemon team management

CREATE DATABASE IF NOT EXISTS pokestop_teams_db;
USE pokestop_teams_db;

CREATE TABLE IF NOT EXISTS Teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL COMMENT 'Reference to Users.id from user-service',
    teamName VARCHAR(100) NOT NULL,
    teamSlot INT NOT NULL DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_slot (userId, teamSlot),
    INDEX idx_user (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS TeamMembers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teamId INT NOT NULL,
    pokemonInstanceId VARCHAR(255),
    position INT NOT NULL DEFAULT 1,
    
    FOREIGN KEY (teamId) REFERENCES Teams(id) ON DELETE CASCADE,
    INDEX idx_team (teamId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. POKEDEX SERVICE DATABASE (PLACEHOLDER)
-- ============================================
-- Database: pokestop_pokedex_db
-- Purpose: Pokemon data reference

CREATE DATABASE IF NOT EXISTS pokestop_pokedex_db;
USE pokestop_pokedex_db;

CREATE TABLE IF NOT EXISTS PokemonData (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pokedexId INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type1 VARCHAR(50),
    type2 VARCHAR(50),
    baseStats JSON,
    abilities JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_pokedex (pokedexId),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pokémon Encounter Service Database
-- Database: pokestop_encounter_db
-- Purpose: Simple spawn & minigame mechanics for web app

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
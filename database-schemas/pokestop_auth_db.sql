-- Authentication Service Database
-- Database: pokestop_auth_db
-- Purpose: JWT refresh tokens, password reset tokens, security tracking

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

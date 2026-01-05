-- ============================================
-- SCOUT 21 PRO - Script SQL Completo
-- ============================================
-- Execute este script no seu MySQL para criar toda a estrutura
-- ============================================

CREATE DATABASE IF NOT EXISTS scout21pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE scout21pro;

-- ============================================
-- TABELA: players (Jogadores)
-- ============================================
CREATE TABLE players (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    position ENUM('Goleiro', 'Fixo', 'Ala', 'Pivô', 'Armador', 'Ponta', 'Meia') NOT NULL,
    photoUrl TEXT,
    jerseyNumber INT NOT NULL,
    dominantFoot ENUM('Destro', 'Canhoto', 'Ambidestro'),
    age INT,
    height INT COMMENT 'Altura em cm',
    lastClub VARCHAR(255),
    isTransferred BOOLEAN DEFAULT FALSE,
    transferDate DATE,
    salary DECIMAL(10, 2) COMMENT 'DADOS SENSÍVEIS',
    salaryStartDate DATE,
    salaryEndDate DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_position (position),
    INDEX idx_jerseyNumber (jerseyNumber),
    INDEX idx_isTransferred (isTransferred)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: competitions (Competições)
-- ============================================
CREATE TABLE competitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: matches (Jogos)
-- ============================================
CREATE TABLE matches (
    id VARCHAR(50) PRIMARY KEY,
    competition VARCHAR(255) NOT NULL,
    opponent VARCHAR(255) NOT NULL,
    location ENUM('Mandante', 'Visitante') NOT NULL,
    date DATE NOT NULL,
    result ENUM('Vitória', 'Derrota', 'Empate') NOT NULL,
    videoUrl TEXT,
    
    -- Estatísticas do Time
    team_minutesPlayed INT DEFAULT 0,
    team_goals INT DEFAULT 0,
    team_goalsConceded INT DEFAULT 0,
    team_assists INT DEFAULT 0,
    team_yellowCards INT DEFAULT 0,
    team_redCards INT DEFAULT 0,
    team_passesCorrect INT DEFAULT 0,
    team_passesWrong INT DEFAULT 0,
    team_wrongPassesTransition INT DEFAULT 0,
    team_tacklesWithBall INT DEFAULT 0,
    team_tacklesCounterAttack INT DEFAULT 0,
    team_tacklesWithoutBall INT DEFAULT 0,
    team_shotsOnTarget INT DEFAULT 0,
    team_shotsOffTarget INT DEFAULT 0,
    team_rpeMatch DECIMAL(3,1) COMMENT 'RPE 0-10',
    team_goalsScoredOpenPlay INT DEFAULT 0,
    team_goalsScoredSetPiece INT DEFAULT 0,
    team_goalsConcededOpenPlay INT DEFAULT 0,
    team_goalsConcededSetPiece INT DEFAULT 0,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_competition (competition),
    INDEX idx_date (date),
    INDEX idx_opponent (opponent),
    INDEX idx_result (result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: match_player_stats (Estatísticas de Jogadores por Jogo)
-- ============================================
CREATE TABLE match_player_stats (
    id VARCHAR(50) PRIMARY KEY,
    matchId VARCHAR(50) NOT NULL,
    playerId VARCHAR(50) NOT NULL,
    
    minutesPlayed INT DEFAULT 0,
    goals INT DEFAULT 0,
    goalsConceded INT DEFAULT 0,
    assists INT DEFAULT 0,
    yellowCards INT DEFAULT 0,
    redCards INT DEFAULT 0,
    passesCorrect INT DEFAULT 0,
    passesWrong INT DEFAULT 0,
    wrongPassesTransition INT DEFAULT 0,
    tacklesWithBall INT DEFAULT 0,
    tacklesCounterAttack INT DEFAULT 0,
    tacklesWithoutBall INT DEFAULT 0,
    shotsOnTarget INT DEFAULT 0,
    shotsOffTarget INT DEFAULT 0,
    rpeMatch DECIMAL(3,1) COMMENT 'RPE 0-10',
    goalsScoredOpenPlay INT DEFAULT 0,
    goalsScoredSetPiece INT DEFAULT 0,
    goalsConcededOpenPlay INT DEFAULT 0,
    goalsConcededSetPiece INT DEFAULT 0,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (matchId) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE KEY unique_match_player (matchId, playerId),
    INDEX idx_matchId (matchId),
    INDEX idx_playerId (playerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: injuries (Lesões)
-- ============================================
CREATE TABLE injuries (
    id VARCHAR(50) PRIMARY KEY,
    playerId VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    endDate DATE,
    type ENUM('Muscular', 'Trauma', 'Articular', 'Outros') NOT NULL,
    location VARCHAR(255) NOT NULL,
    severity ENUM('Leve', 'Moderada', 'Grave') NOT NULL,
    daysOut INT,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_playerId (playerId),
    INDEX idx_date (date),
    INDEX idx_type (type),
    INDEX idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: assessments (Avaliações Físicas)
-- ============================================
CREATE TABLE assessments (
    id VARCHAR(50) PRIMARY KEY,
    playerId VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    
    -- Dobras Cutâneas (mm)
    chest DECIMAL(5,2),
    axilla DECIMAL(5,2),
    subscapular DECIMAL(5,2),
    triceps DECIMAL(5,2),
    abdominal DECIMAL(5,2),
    suprailiac DECIMAL(5,2),
    thigh DECIMAL(5,2),
    
    bodyFatPercent DECIMAL(5,2) COMMENT 'Percentual de gordura corporal',
    actionPlan TEXT COMMENT 'Plano de ação',
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_playerId (playerId),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: schedules (Programações)
-- ============================================
CREATE TABLE schedules (
    id VARCHAR(50) PRIMARY KEY,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    createdAt BIGINT COMMENT 'Timestamp para auto-delete após 30 dias',
    isActive BOOLEAN DEFAULT FALSE,
    
    INDEX idx_startDate (startDate),
    INDEX idx_endDate (endDate),
    INDEX idx_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: schedule_days (Dias das Programações)
-- ============================================
CREATE TABLE schedule_days (
    id VARCHAR(50) PRIMARY KEY,
    scheduleId VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    weekday VARCHAR(20),
    activity VARCHAR(255),
    time VARCHAR(20),
    location VARCHAR(255),
    notes TEXT,
    
    FOREIGN KEY (scheduleId) REFERENCES schedules(id) ON DELETE CASCADE,
    INDEX idx_scheduleId (scheduleId),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: budget_entries (Entradas Orçamentárias)
-- ============================================
CREATE TABLE budget_entries (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM(
        'Patrocínios Masters',
        'Patrocínios',
        'Apoiadores',
        'Recursos Municipal',
        'Recursos Estaduais',
        'Recursos Federais',
        'Bilheteria',
        'Outros'
    ) NOT NULL,
    expectedDate DATE NOT NULL,
    value DECIMAL(12, 2) NOT NULL,
    status ENUM('Pendente', 'Recebido') NOT NULL,
    receivedDate DATE,
    category ENUM('Fixo', 'Variável'),
    startDate DATE,
    endDate DATE,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_expectedDate (expectedDate),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: budget_expenses (Despesas Orçamentárias)
-- ============================================
CREATE TABLE budget_expenses (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM(
        'Salários Jogadores',
        'Salários Comissão Técnica',
        'Alimentação Diária',
        'Alimentação Viagens',
        'Transporte',
        'Hotel',
        'Arbitragem',
        'Materiais',
        'Uniformes',
        'Moradia',
        'Água',
        'Luz',
        'Outros'
    ) NOT NULL,
    date DATE NOT NULL,
    value DECIMAL(12, 2) NOT NULL,
    status ENUM('Pendente', 'Pago') NOT NULL,
    paidDate DATE,
    category ENUM('Fixo', 'Variável'),
    startDate DATE,
    endDate DATE,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: stat_targets (Metas de Estatísticas)
-- ============================================
CREATE TABLE stat_targets (
    id VARCHAR(50) PRIMARY KEY,
    goals INT DEFAULT 3,
    assists INT DEFAULT 3,
    passesCorrect INT DEFAULT 30,
    passesWrong INT DEFAULT 5,
    shotsOn INT DEFAULT 8,
    shotsOff INT DEFAULT 5,
    tacklesPossession INT DEFAULT 10,
    tacklesNoPossession INT DEFAULT 10,
    tacklesCounter INT DEFAULT 5,
    transitionError INT DEFAULT 2,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: users (Usuários - Opcional)
-- ============================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('Treinador', 'Preparador Físico', 'Supervisor', 'Diretor', 'Atleta') NOT NULL,
    linkedPlayerId VARCHAR(50),
    photoUrl TEXT,
    passwordHash VARCHAR(255) COMMENT 'Hash da senha',
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (linkedPlayerId) REFERENCES players(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Competições padrão
INSERT INTO competitions (name) VALUES 
('Copa Santa Catarina'),
('Série Prata'),
('JASC');

-- Metas padrão
INSERT INTO stat_targets (id, goals, assists, passesCorrect, passesWrong, shotsOn, shotsOff, tacklesPossession, tacklesNoPossession, tacklesCounter, transitionError) 
VALUES ('default', 3, 3, 30, 5, 8, 5, 10, 10, 5, 2);

-- ============================================
-- FIM DO SCRIPT
-- ============================================










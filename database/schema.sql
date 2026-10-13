-- Reference schema for QuizHub Enterprise (MySQL).
-- Reference schema for inspection. Production schema changes are versioned in
-- backend/src/main/resources/db/migration and applied by Flyway.
CREATE DATABASE IF NOT EXISTS quizhub;
USE quizhub;

CREATE TABLE IF NOT EXISTS users (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  username  VARCHAR(100) NOT NULL UNIQUE,
  email     VARCHAR(100) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,                    -- BCrypt hash
  role      VARCHAR(20)  NOT NULL DEFAULT 'STUDENT',  -- STUDENT or ADMIN
  xp        BIGINT       NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quizzes (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(150) NOT NULL UNIQUE,
  subject          VARCHAR(100) DEFAULT 'General',
  description      TEXT,
  difficulty       VARCHAR(20)  DEFAULT 'Medium',
  duration_minutes INT          NOT NULL DEFAULT 5,
  is_pyq           BOOLEAN      NOT NULL DEFAULT FALSE,
  year             VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS questions (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  quiz_id        BIGINT       NOT NULL,
  text           TEXT         NOT NULL,
  option_a       TEXT         NOT NULL,
  option_b       TEXT         NOT NULL,
  option_c       TEXT         NOT NULL,
  option_d       TEXT         NOT NULL,
  correct_option INT          NOT NULL,               -- 0=A, 1=B, 2=C, 3=D
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS results (
  id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id            BIGINT       NOT NULL,
  quiz_id            BIGINT       NOT NULL,
  score              INT          NOT NULL,
  total              INT          NOT NULL,
  time_taken_seconds INT          NOT NULL DEFAULT 0,
  xp_earned          INT          NOT NULL DEFAULT 0,
  badge              VARCHAR(100),
  taken_at           DATETIME     NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

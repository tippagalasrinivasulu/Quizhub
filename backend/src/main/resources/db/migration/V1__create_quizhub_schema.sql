CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    xp BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE quizzes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    subject VARCHAR(100),
    description TEXT,
    difficulty VARCHAR(20),
    duration_minutes INT NOT NULL,
    is_pyq BIT NOT NULL,
    year VARCHAR(50),
    PRIMARY KEY (id),
    CONSTRAINT uk_quizzes_title UNIQUE (title)
);

CREATE TABLE questions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    quiz_id BIGINT NOT NULL,
    text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
);

CREATE TABLE results (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    score INT NOT NULL,
    total INT NOT NULL,
    time_taken_seconds INT NOT NULL,
    xp_earned INT NOT NULL,
    badge VARCHAR(100),
    taken_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_results_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_results_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
);

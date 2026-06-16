-- SQLite schema for ASHS Gym join applications
CREATE TABLE IF NOT EXISTS gym_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  grade TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_program TEXT NOT NULL,
  fitness_goals TEXT NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Example insert statement:
-- INSERT INTO gym_applications (
--   full_name, age, grade, email, phone, preferred_program, fitness_goals
-- ) VALUES (
--   'Alex Turner', 15, '10', 'alex.turner@example.com', '5551234567', 'Strength Sessions', 'Build more upper body strength and improve stamina.'
-- );

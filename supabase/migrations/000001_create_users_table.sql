-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(50),
    avatar_url TEXT,
    height_cm INT CHECK (height_cm > 50 AND height_cm < 300),
    weight_kg INT CHECK (weight_kg > 20 AND weight_kg < 200),
    position VARCHAR(20),
    preferred_language VARCHAR(10) DEFAULT 'zh-CN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Indexes
CREATE INDEX idx_users_email ON users(email);

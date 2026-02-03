CREATE TABLE shooting_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES analysis_tasks(id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    total_attempts INT NOT NULL,
    made_shots INT NOT NULL,
    shooting_percentage FLOAT GENERATED ALWAYS AS (
        CASE WHEN total_attempts > 0 THEN (made_shots::FLOAT / total_attempts::FLOAT) * 100 ELSE 0 END
    ) STORED,
    mechanics_score INT,
    consistency_knee FLOAT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE shooting_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shooting records" ON shooting_records
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own shooting records" ON shooting_records
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own shooting records" ON shooting_records
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own shooting records" ON shooting_records
    FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE INDEX idx_shooting_records_user_id ON shooting_records(user_id);
CREATE INDEX idx_shooting_records_analysis_id ON shooting_records(analysis_id);
CREATE INDEX idx_shooting_records_session_date ON shooting_records(session_date);

-- 删除所有表的 RLS 策略
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own analysis tasks" ON analysis_tasks;
DROP POLICY IF EXISTS "Users can create own analysis tasks" ON analysis_tasks;
DROP POLICY IF EXISTS "Users can update own analysis tasks" ON analysis_tasks;
DROP POLICY IF EXISTS "Users can delete own analysis tasks" ON analysis_tasks;
DROP POLICY IF EXISTS "Users can view own shooting records" ON shooting_records;
DROP POLICY IF EXISTS "Users can create own shooting records" ON shooting_records;
DROP POLICY IF EXISTS "Users can update own shooting records" ON shooting_records;
DROP POLICY IF EXISTS "Users can delete own shooting records" ON shooting_records;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- 删除所有外键约束
ALTER TABLE analysis_tasks DROP CONSTRAINT IF EXISTS analysis_tasks_user_id_fkey;
ALTER TABLE shooting_records DROP CONSTRAINT IF EXISTS shooting_records_user_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- 修改 users 表的 ID 字段
ALTER TABLE users ALTER COLUMN id TYPE TEXT;

-- 修改关联表的 user_id 字段
ALTER TABLE analysis_tasks ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE shooting_records ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE orders ALTER COLUMN user_id TYPE TEXT;

-- 重新添加外键约束
ALTER TABLE analysis_tasks ADD CONSTRAINT analysis_tasks_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE shooting_records ADD CONSTRAINT shooting_records_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 重新创建简化的 RLS 策略（MVP 阶段临时开放权限）
CREATE POLICY "Anyone can view users" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view analysis tasks" ON analysis_tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can create analysis tasks" ON analysis_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update analysis tasks" ON analysis_tasks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete analysis tasks" ON analysis_tasks FOR DELETE USING (true);

CREATE POLICY "Anyone can view shooting records" ON shooting_records FOR SELECT USING (true);
CREATE POLICY "Anyone can create shooting records" ON shooting_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update shooting records" ON shooting_records FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete shooting records" ON shooting_records FOR DELETE USING (true);

CREATE POLICY "Anyone can view orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON orders FOR UPDATE USING (true);

-- 更新 analysis_tasks 的 RLS 策略
DROP POLICY IF EXISTS "Anyone can view analysis tasks" ON analysis_tasks;
DROP POLICY IF EXISTS "Anyone can create analysis tasks" ON analysis_tasks;
DROP POLICY IF EXISTS "Anyone can update analysis tasks" ON analysis_tasks;
DROP POLICY IF EXISTS "Anyone can delete analysis tasks" ON analysis_tasks;

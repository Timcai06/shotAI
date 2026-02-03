# Supabase Power - Quick Reference

## ✅ Setup Complete!

Your Supabase project is now fully configured and connected:
- ✅ CLI installed and authenticated
- ✅ Project linked: `jysufktrfwviehurkwiz`
- ✅ Database migrations applied (5 tables created)
- ✅ TypeScript types generated

## Common Commands

### 1. Generate TypeScript Types
After any schema changes, regenerate types:
```bash
npx supabase gen types typescript --linked > types/supabase-generated.ts
```

### 2. Check Migration Status
See which migrations are applied locally vs remotely:
```bash
npx supabase migration list --linked
```

### 3. Push Migrations to Remote
Apply local migrations to your hosted database:
```bash
npx supabase db push --linked
```

### 4. Pull Remote Schema Changes
If you made changes in the Supabase dashboard:
```bash
npx supabase db pull new_migration_name --linked
```

### 5. View Database Schema
```bash
npx supabase db diff --linked
```

## Example: Using Supabase in Your Code

### Query Analysis Tasks
```typescript
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase-generated'

const supabase = createClient()

// Get all analysis tasks for current user
const { data, error } = await supabase
  .from('analysis_tasks')
  .select('*')
  .order('created_at', { ascending: false })

// Create a new analysis task
const { data: newTask, error } = await supabase
  .from('analysis_tasks')
  .insert({
    user_id: userId,
    video_url: videoUrl,
    status: 'pending'
  })
  .select()
  .single()
```

### Using Generated Types
```typescript
import type { Database } from '@/types/supabase-generated'

type AnalysisTask = Database['public']['Tables']['analysis_tasks']['Row']
type AnalysisTaskInsert = Database['public']['Tables']['analysis_tasks']['Insert']

const createTask = async (task: AnalysisTaskInsert) => {
  // TypeScript will validate the structure
  const { data, error } = await supabase
    .from('analysis_tasks')
    .insert(task)
}
```

## Your Database Schema

You have 4 main tables:
1. **users** - User profiles with basketball player info
2. **analysis_tasks** - Video analysis requests and results
3. **shooting_records** - Historical shooting performance data
4. **orders** - Payment records for premium features

All tables have Row Level Security (RLS) enabled, so users can only access their own data.

## Next Steps with Supabase Power

Ask me to help you with:
- "Create a new migration to add a column"
- "Set up authentication in my Next.js app"
- "Add RLS policies for a new table"
- "Generate types after schema changes"
- "Create a PostgreSQL function"
- "Set up real-time subscriptions"

The power includes steering guides for all these workflows!

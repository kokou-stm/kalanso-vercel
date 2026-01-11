# Student ID Implementation Guide

## Current State (MVP/Demo)

The application currently uses **mock UUID** for student identification:
- Mock UUID: `00000000-0000-0000-0000-000000000001`
- Used in: Real-World Insight tracking, feedback system
- Database: All `student_id` columns are UUID type

## Database Schema Consistency

All tables in the database use **UUID** for `student_id`:
- ✅ `student_enrollments.student_id` - UUID
- ✅ `student_session_progress.student_id` - UUID
- ✅ `insight_engagement.student_id` - UUID
- ✅ `insight_feedback.student_id` - UUID
- ✅ `insight_shares.student_id` - UUID
- ✅ `insight_learning_impact.student_id` - UUID
- ✅ `student_insight_views.student_id` - UUID

**Do NOT change these to VARCHAR** - maintain UUID consistency across all tables.

## Production Implementation

### Step 1: Add Supabase Authentication

```typescript
// lib/supabase/auth.ts
import { createClient } from "@/lib/supabase/client"

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error("Failed to get user:", error)
    return null
  }
  
  return user.id // This is a UUID
}
```

### Step 2: Update Components

Replace mock UUID with real authentication:

```typescript
// components/real-world-insight-card.tsx
import { getCurrentUserId } from "@/lib/supabase/auth"

export function RealWorldInsightCard({ insight, language, onDismiss }: RealWorldInsightCardProps) {
  const [studentId, setStudentId] = useState<string | null>(null)
  
  useEffect(() => {
    async function loadUser() {
      const id = await getCurrentUserId()
      setStudentId(id)
    }
    loadUser()
  }, [])
  
  // Use studentId in API calls
}
```

### Step 3: Server-Side Authentication

For API routes, use server-side Supabase client:

```typescript
// app/api/insights/engagement/route.ts
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const studentId = user.id // Use authenticated user's UUID
  // ... rest of implementation
}
```

## Migration Path

If you need to migrate existing data:

1. **Option A**: Delete test data and start fresh with UUIDs
   ```sql
   DELETE FROM insight_engagement WHERE student_id::text = '00000000-0000-0000-0000-000000000001';
   DELETE FROM insight_feedback WHERE student_id::text = '00000000-0000-0000-0000-000000000001';
   ```

2. **Option B**: Map demo data to real user
   ```sql
   -- After user signs up, update their demo data
   UPDATE insight_engagement 
   SET student_id = 'real-user-uuid-here'::uuid 
   WHERE student_id = '00000000-0000-0000-0000-000000000001'::uuid;
   ```

## Testing

Test with multiple users to ensure UUID handling:

```typescript
// Test with real Supabase auth
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123'
})

// User ID will be a real UUID like: '550e8400-e29b-41d4-a716-446655440000'
console.log(data.user?.id)
```

## Key Points

- ✅ Use UUID format for all student IDs
- ✅ Never use strings like "student_123" in production
- ✅ All database tables use UUID type for student_id
- ✅ Mock UUID (`00000000-0000-0000-0000-000000000001`) is only for demo/MVP
- ✅ Production must use Supabase Auth UUIDs
- ❌ Do NOT convert database columns to VARCHAR

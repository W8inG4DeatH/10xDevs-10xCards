/* Database Schema for 10xDevs-10xCards MVP */

# Database Schema

## 1. Tables

### users (this table is managed by Supabase Auth)
- **id**: BIGSERIAL PRIMARY KEY
- **email**: VARCHAR(255) NOT NULL UNIQUE
- **password**: TEXT NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

### flashcards
- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **front**: TEXT NOT NULL
- **back**: TEXT NOT NULL
- **source**: VARCHAR(20) NOT NULL DEFAULT 'MANUAL' CHECK (source IN ('AI', 'MANUAL'))
- **status**: VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected'))
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

### generation_sessions
- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **session_input**: TEXT NOT NULL
- **session_output**: JSONB
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

## 2. Relationships
- Each user (users.id) can have many flashcards (flashcards.user_id).
- Each user (users.id) can have many generation sessions (generation_sessions.user_id).

## 3. Indexes
- CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
- CREATE INDEX idx_flashcards_created_at ON flashcards(created_at);
- CREATE INDEX idx_generation_sessions_user_id ON generation_sessions(user_id);
- CREATE INDEX idx_generation_sessions_created_at ON generation_sessions(created_at);

## 4. Row Level Security (RLS) Policies
Enable RLS on sensitive tables and define policies to ensure users only access their own records. For example:

```sql
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY flashcards_policy ON flashcards
  USING (user_id = current_setting('app.current_user_id')::bigint);

ALTER TABLE generation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY generation_sessions_policy ON generation_sessions
  USING (user_id = current_setting('app.current_user_id')::bigint);
```

*Note: The application must set the parameter `app.current_user_id` appropriately for session management.*

## 5. Additional Notes
- **Triggers**: Implement triggers to automatically update the `updated_at` column on each update. A trigger function (e.g., `update_updated_at()`) can be created and attached to each table.
- **Constraints**: Additional constraints (e.g., minimum/maximum length for `front` and `back` fields) can be defined based on further application requirements.
- **Scalability**: Consider table partitioning for very large datasets as the application scales. 
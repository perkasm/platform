-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

/**
https://dev.to/yukaty/setting-up-postgresql-with-pgvector-using-docker-hcl

Querying:
-- Find items similar to a specific vector
SELECT id, name, item_data
FROM vector_items
ORDER BY embedding <-> '[0.1, 0.2, ...]'::vector
LIMIT 5;

**/
-- Create sample table
CREATE TABLE IF NOT EXISTS vector_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    item_data JSONB,
    embedding vector(1536) -- vector data
);
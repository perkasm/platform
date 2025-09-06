-- Initial database setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a default schema
CREATE SCHEMA IF NOT EXISTS app;

-- Grant permissions to the user
GRANT ALL PRIVILEGES ON SCHEMA app TO perkasm;
ALTER USER perkasm SET search_path TO app, public;

-- Set default privileges for future tables in the schema
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON TABLES TO perkasm;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON SEQUENCES TO perkasm;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON FUNCTIONS TO perkasm;

-- Add any initial tables or data here as needed
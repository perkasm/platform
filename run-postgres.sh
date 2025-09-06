#!/bin/bash

# Script to start only the PostgreSQL service from docker-compose.yml
# and wait until the database is ready

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed or not in PATH"
    exit 1
fi

# Start only the postgres service
echo "Starting PostgreSQL service..."
docker-compose up -d postgres

# Check if the service started successfully
if [ $? -ne 0 ]; then
    echo "Failed to start PostgreSQL service"
    exit 1
fi

# Wait for the database to be ready
echo "Waiting for PostgreSQL to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    # Check if container is running
    if docker-compose ps postgres | grep -q "Up"; then
        # Check if database is ready using pg_isready
        if docker-compose exec postgres pg_isready -U perkasm -d perkasm &> /dev/null; then
            echo "PostgreSQL service is ready!"
            echo "Database is available at localhost:5432"
            echo "Database name: perkasm"
            echo "Username: perkasm"
            echo "Password: password"
            exit 0
        fi
    fi
    
    echo "Attempt $ATTEMPT/$MAX_ATTEMPTS: Database not ready yet..."
    ATTEMPT=$((ATTEMPT + 1))
    sleep 2
done

echo "Timeout waiting for PostgreSQL to be ready"
exit 1
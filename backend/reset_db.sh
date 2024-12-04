#!/bin/bash

DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="newspulse_db"
DB_USER="newspulse_user"

echo "Starting database reset process..."

# Drop and create the database
echo "Dropping and recreating the database..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" || exit 1
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" || exit 1

# Create initial tables using SQLAlchemy
echo "Creating initial tables..."
python -c "
from app.database import engine, Base
Base.metadata.create_all(bind=engine)
" || exit 1

# Apply migrations
echo "Applying Alembic migrations..."
alembic upgrade head || exit 1

echo "Database reset process completed successfully!"

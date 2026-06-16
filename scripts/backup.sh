#!/bin/bash
set -e

# Config
BACKUP_DIR="/home/pradipta/backups/fitracker"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/fitracker_backup_${TIMESTAMP}.sql.gz"
DB_CONTAINER=$(docker compose ps -q db 2>/dev/null || docker ps -qf "name=fitracker-db" || echo "fitracker-db-1")
DB_USER=${POSTGRES_USER:-fitracker}
DB_NAME="fitracker"

echo "Starting database backup..."
mkdir -p "${BACKUP_DIR}"

# Run pg_dump via docker
docker exec -t "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "Backup created at: ${BACKUP_FILE}"

# Retain last 30 days of backups
echo "Cleaning up backups older than 30 days..."
find "${BACKUP_DIR}" -type f -name "fitracker_backup_*.sql.gz" -mtime +30 -delete

echo "Backup process completed."

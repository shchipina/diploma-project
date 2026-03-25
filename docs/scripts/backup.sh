BACKUP_DIR="/var/backups/skillshare"
PROJECT_DIR="/var/www/skillshare/backend"
DB_NAME="skillshare_prod"
DB_USER="skillshare_user"
DATE=$(date +%F_%H-%M)
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

echo "Розпочато резервне копіювання: $DATE"

echo "🗄️ Створення дампу бази даних..."
pg_dump -U $DB_USER -d $DB_NAME -F c -f "$BACKUP_DIR/db_backup_$DATE.dump"

if [ $? -eq 0 ]; then
    echo "Дамп бази даних успішно створено."
else
    echo "ПОМИЛКА: Не вдалося створити дамп бази даних!"
    exit 1
fi

echo "Копіювання файлів конфігурації..."
cp "$PROJECT_DIR/.env" "$BACKUP_DIR/env_backup_$DATE.env"

echo "Видалення копій, старіших за $RETENTION_DAYS днів..."
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

echo "Резервне копіювання успішно завершено!"

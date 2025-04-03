#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/mongodb"
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/nopay_club"}
BACKUP_RETAIN_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$DATE"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Display info
echo "🔄 Starting MongoDB backup..."
echo "📂 Backup location: $BACKUP_DIR/$BACKUP_NAME"

# Create the backup using mongodump
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$BACKUP_NAME"

# Check if the backup was successful
if [ $? -eq 0 ]; then
    echo "✅ Database backup created successfully"
    
    # Compress the backup
    echo "🔄 Compressing backup..."
    cd $BACKUP_DIR
    tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
    
    # Check if compression was successful
    if [ $? -eq 0 ]; then
        echo "✅ Backup compressed successfully"
        
        # Remove the uncompressed backup directory
        rm -rf "$BACKUP_NAME"
        
        # Clean up old backups
        echo "🔄 Cleaning up old backups..."
        find $BACKUP_DIR -name "backup_*.tar.gz" -type f -mtime +$BACKUP_RETAIN_DAYS -delete
        
        echo "✅ Backup process completed successfully"
        echo "📋 Backup file: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
    else
        echo "❌ Failed to compress backup"
    fi
else
    echo "❌ Database backup failed"
fi

# Information on restoring from backup
echo ""
echo "📋 To restore this backup, run:"
echo "  1. tar -xzf $BACKUP_DIR/$BACKUP_NAME.tar.gz -C /tmp/"
echo "  2. mongorestore --uri=\"$MONGODB_URI\" --drop /tmp/$BACKUP_NAME/nopay_club"
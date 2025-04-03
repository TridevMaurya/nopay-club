#!/bin/bash

# Check if a URL argument is provided
if [ -z "$1" ]; then
  echo "Error: Please provide the new Canva invite link as an argument"
  echo "Usage: ./update-canva-link.sh \"https://www.canva.com/brand/join?token=NEW_TOKEN&referrer=team-invite\""
  exit 1
fi

# Store the new URL
NEW_URL="$1"

# Escape special characters in the URL for sed
ESCAPED_URL=$(echo "$NEW_URL" | sed 's/[\/&]/\\&/g')

# Path to the file containing the Canva link
CANVA_LINK_FILE="client/src/lib/canvaLinks.ts"

# Check if the file exists
if [ ! -f "$CANVA_LINK_FILE" ]; then
  echo "Error: Cannot find the canvaLinks.ts file at $CANVA_LINK_FILE"
  exit 1
fi

# Create a backup of the original file
cp "$CANVA_LINK_FILE" "${CANVA_LINK_FILE}.bak"

# Update the link in the file
sed -i "s/export const CANVA_INVITE_LINK = \".*\"/export const CANVA_INVITE_LINK = \"$ESCAPED_URL\"/" "$CANVA_LINK_FILE"

# Check if the update was successful
if grep -q "export const CANVA_INVITE_LINK = \"$ESCAPED_URL\"" "$CANVA_LINK_FILE"; then
  echo "✅ Canva invite link updated successfully to: $NEW_URL"
  
  # Build the application
  echo "🔄 Building the application..."
  npm run build
  
  # Check if the build was successful
  if [ $? -eq 0 ]; then
    # Restart the application with PM2 if it exists
    if command -v pm2 &> /dev/null; then
      echo "🔄 Restarting the application with PM2..."
      pm2 restart nopay-club || echo "⚠️ Warning: PM2 restart failed. You may need to restart the application manually."
    else
      echo "⚠️ PM2 not found. Please restart the application manually."
    fi
    
    echo "🎉 All done! The new Canva invite link is now live."
  else
    echo "❌ Build failed. Restoring the original file from backup."
    cp "${CANVA_LINK_FILE}.bak" "$CANVA_LINK_FILE"
  fi
else
  echo "❌ Failed to update the Canva invite link. Restoring the original file from backup."
  cp "${CANVA_LINK_FILE}.bak" "$CANVA_LINK_FILE"
fi

# Remove the backup file
rm "${CANVA_LINK_FILE}.bak"

# Quick instructions for verifying the update
echo ""
echo "📋 Next steps:"
echo "1. Verify that the new link works by visiting your website"
echo "2. Make sure all colored buttons are working correctly"
echo "3. If you encounter any issues, you can manually edit $CANVA_LINK_FILE"
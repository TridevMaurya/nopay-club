#!/bin/bash

# Simple monitoring script for NoPay Club application
# Usage: ./monitor.sh [--email your@email.com]

# Configuration
EMAIL=""

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --email) EMAIL="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Function to print section headers
print_header() {
    echo "========================================"
    echo "  $1"
    echo "========================================"
}

# Create output
OUTPUT=""

# Add timestamp
OUTPUT+="Report generated on: $(date)\n\n"

# Server uptime and load
print_header "SYSTEM UPTIME AND LOAD"
OUTPUT+="$(uptime)\n\n"

# Memory usage
print_header "MEMORY USAGE"
OUTPUT+="$(free -h)\n\n"

# Disk usage
print_header "DISK USAGE"
OUTPUT+="$(df -h /)\n\n"

# MongoDB status
print_header "MONGODB STATUS"
if command -v systemctl &> /dev/null && systemctl is-active --quiet mongod; then
    OUTPUT+="MongoDB is running: ✅\n"
else
    OUTPUT+="MongoDB is not running: ❌\n"
fi
OUTPUT+="\n"

# Node.js application status
print_header "APPLICATION STATUS"
if command -v pm2 &> /dev/null; then
    OUTPUT+="$(pm2 status nopay-club)\n"
else
    OUTPUT+="PM2 not installed, can't check application status\n"
fi
OUTPUT+="\n"

# Nginx status
print_header "NGINX STATUS"
if command -v systemctl &> /dev/null && systemctl is-active --quiet nginx; then
    OUTPUT+="Nginx is running: ✅\n"
else
    OUTPUT+="Nginx is not running: ❌\n"
fi
OUTPUT+="\n"

# Current connections
print_header "CURRENT CONNECTIONS"
if command -v netstat &> /dev/null; then
    OUTPUT+="$(netstat -an | grep :80 | grep ESTABLISHED | wc -l) HTTP connections\n"
    OUTPUT+="$(netstat -an | grep :443 | grep ESTABLISHED | wc -l) HTTPS connections\n"
fi
OUTPUT+="\n"

# Recent errors in logs
print_header "RECENT APPLICATION ERRORS"
if command -v pm2 &> /dev/null; then
    ERROR_LOG=$(pm2 logs nopay-club --lines 100 --nostream 2>&1 | grep -i "error\|exception" | tail -n 10)
    if [ -n "$ERROR_LOG" ]; then
        OUTPUT+="$ERROR_LOG\n"
    else
        OUTPUT+="No recent errors found in the application logs.\n"
    fi
fi
OUTPUT+="\n"

# Print output to console
echo -e "$OUTPUT"

# Send email if requested
if [ -n "$EMAIL" ] && command -v mail &> /dev/null; then
    echo -e "$OUTPUT" | mail -s "NoPay Club Server Monitoring Report" "$EMAIL"
    echo "Email sent to $EMAIL"
fi
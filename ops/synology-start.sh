#!/bin/sh
set -eu

APP_DIR="/volume1/homes/roberto/pasos-en-familia-prod"
DATA_DIR="/volume1/homes/roberto/pasos-en-familia-data"
NODE="/var/packages/Node.js_v18/target/usr/local/bin/node"
PID_FILE="$APP_DIR/pasos.pid"
LOG_FILE="$APP_DIR/pasos.log"

mkdir -p "$DATA_DIR"
chmod 700 "$DATA_DIR"
cd "$APP_DIR"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  exit 0
fi

export NODE_ENV=production
export HOSTNAME=0.0.0.0
export PORT=3100
export FAMILY_DATA_DIR="$DATA_DIR"
export COOKIE_SECURE=false

nohup "$NODE" server.js >> "$LOG_FILE" 2>&1 &
echo "$!" > "$PID_FILE"

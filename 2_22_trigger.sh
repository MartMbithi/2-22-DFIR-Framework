#!/bin/bash

#############################################
# 2:22 DFIR FRAMEWORK ORCHESTRATION TRIGGER
#############################################

set -e

echo ""
echo "============================================"
echo "        2:22 DFIR FRAMEWORK TRIGGER"
echo "============================================"
echo ""

#############################################
# CONFIG
#############################################

BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

API_PORT=8000
FRONTEND_PORT=3000

API_URL="http://127.0.0.1:$API_PORT"
FRONTEND_URL="http://127.0.0.1:$FRONTEND_PORT"

#############################################
# PYTHON CHECK
#############################################

echo "[1] Checking Python..."

if ! command -v python3 &> /dev/null; then
  echo "❌ Python3 not installed"
  exit 1
fi

echo "✔ Python: $(python3 --version)"

#############################################
# NODE CHECK
#############################################

echo ""
echo "[2] Checking Node..."

if ! command -v node &> /dev/null; then
  echo "❌ NodeJS missing"
  exit 1
fi

echo "✔ Node: $(node --version)"

#############################################
# ENV CHECK
#############################################

echo ""
echo "[3] Checking .env..."

if [ ! -f ".env" ]; then
  echo "❌ .env file missing"
  exit 1
fi

echo "✔ Environment file detected"

#############################################
# LOAD ENV VARIABLES
#############################################

export $(grep -v '^#' .env | xargs)

#############################################
# PYTHON ENV
#############################################

echo ""
echo "[4] Preparing Python environment..."

start_time=$(date +%s)

# spinner function
spinner() {
  local pid=$!
  local delay=0.1
  local spinstr='|/-\'
  while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
    local temp=${spinstr#?}
    printf " [%c]  " "$spinstr"
    spinstr=$temp${spinstr%"$temp"}
    sleep $delay
    printf "\b\b\b\b\b\b"
  done
  printf "    \b\b\b\b"
}

# create venv
if [ ! -d "venv" ]; then
  echo "→ Creating virtual environment..."
  python3 -m venv venv &
  spinner
  echo "✔ Virtual environment created"
else
  echo "✔ Virtual environment already exists"
fi

# activate
echo "→ Activating environment..."
source venv/bin/activate
echo "✔ Environment activated"

# upgrade pip
echo "→ Upgrading pip..."
pip install --upgrade pip > /dev/null 2>&1 &
spinner
echo "✔ Pip upgraded"

# install requirements
echo "→ Installing backend dependencies..."
pip install -r requirements.txt > /dev/null 2>&1 &
spinner
echo "✔ Dependencies installed"

end_time=$(date +%s)
duration=$((end_time - start_time))

echo "✔ Python environment ready (${duration}s)"

#############################################
# FRONTEND DEPENDENCIES
#############################################

echo ""
echo "[5] Checking frontend..."

if [ -d "$FRONTEND_DIR" ]; then
  cd $FRONTEND_DIR

  if [ ! -d "node_modules" ]; then
    npm install
  fi

  cd ..
  echo "✔ Frontend dependencies ready"
else
  echo "⚠ Frontend directory not found"
fi

#############################################
# DATABASE CHECK
#############################################

echo ""
echo "[6] Verifying database connection..."

python3 << END
import os
from sqlalchemy import create_engine

host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD", "")
db = os.getenv("DB_NAME")
port = os.getenv("DB_PORT")

if not host or not user or not db:
    print("❌ Missing DB configuration in .env")
    exit(1)

db_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db}"

try:
    engine = create_engine(db_url)
    conn = engine.connect()
    print("✔ Database connection OK")
except Exception as e:
    print("❌ Database connection failed:", e)
    exit(1)
END

#############################################
# DATABASE MIGRATIONS
#############################################

echo ""
echo "[7] Running database migrations..."

if command -v alembic &> /dev/null; then
  alembic upgrade head
  echo "✔ Migrations complete"
else
  echo "⚠ Alembic not installed, skipping migrations"
fi

#############################################
# JWT SECRET CHECK
#############################################
echo ""
echo "[8] Checking JWT configuration..."

JWT_SECRET_VALUE=${JWT_SECRET:-$JWT_SECRET_KEY}

if [ -z "$JWT_SECRET_VALUE" ]; then
  echo "❌ JWT secret missing in .env"
  echo "Add either JWT_SECRET or JWT_SECRET_KEY"
  exit 1
fi

echo "✔ JWT secret configured"


#############################################
# DFIR SELF TEST
#############################################

echo ""
echo "[11] Running DFIR engine self-test..."

python3 << END
try:
    from dfir_core.ingestion.file_ingest import DiscoverAndParseRawFiles
    print("✔ DFIR ingestion module OK")
except Exception as e:
    print("❌ DFIR ingestion module failed:", e)
END

#############################################
# INGESTION DIAGNOSTICS
#############################################

echo ""
echo "[12] Checking ingestion pipeline..."

if [ -d "uploads" ]; then
  echo "✔ Upload directory present"
else
  mkdir uploads
  echo "✔ Upload directory created"
fi

#############################################
# START BACKEND
#############################################

echo ""
echo "[13] Starting backend..."

nohup uvicorn backend.main:app \
  --host 0.0.0.0 \
  --port $API_PORT \
  --reload \
  > backend.log 2>&1 &

BACKEND_PID=$!

sleep 4

#############################################
# BACKEND HEALTH
#############################################

if curl -s $API_URL/docs > /dev/null; then
  echo "✔ Backend healthy"
else
  echo "❌ Backend failed to start"
  exit 1
fi

#############################################
# START FRONTEND
#############################################

if [ -d "$FRONTEND_DIR" ]; then
  echo ""
  echo "[14] Starting frontend..."

  cd $FRONTEND_DIR

  nohup npm run dev \
  -- --port $FRONTEND_PORT \
  > ../frontend.log 2>&1 &

  FRONTEND_PID=$!

  cd ..

  sleep 4

  echo "✔ Frontend running"
fi

#############################################
# FINAL STATUS
#############################################

echo ""
echo "============================================"
echo "        2:22 PLATFORM ONLINE"
echo "============================================"
echo ""

echo "Backend API:"
echo "→ $API_URL/docs"

echo ""
echo "Frontend:"
echo "→ $FRONTEND_URL"

echo ""
echo "Logs:"
echo "backend.log"
echo "frontend.log"

echo ""
echo "PIDs:"
echo "Backend: $BACKEND_PID"
echo "Frontend: $FRONTEND_PID"

echo ""
echo "2:22 DFIR Framework Ready."
echo ""
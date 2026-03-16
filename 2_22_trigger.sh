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

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

source venv/bin/activate

pip install --upgrade pip > /dev/null

pip install -r requirements.txt > /dev/null

echo "✔ Backend dependencies verified"

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
import sqlalchemy

url = os.getenv("DATABASE_URL")

try:
    engine = sqlalchemy.create_engine(url)
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

if [ -z "$JWT_SECRET" ]; then
  echo "❌ JWT_SECRET missing in .env"
  exit 1
fi

echo "✔ JWT secret configured"

#############################################
# CREATE DEFAULT ADMIN
#############################################

echo ""
echo "[9] Checking default admin user..."

python3 << END
import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from backend.models.users import User
from backend.security import hash_password

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

admin = db.query(User).filter(User.user_email=="admin@dfir.local").first()

if not admin:
    user = User(
        user_email="admin@dfir.local",
        user_password_hash=hash_password("admin123")
    )
    db.add(user)
    db.commit()
    print("✔ Default admin created (admin@dfir.local / admin123)")
else:
    print("✔ Admin user exists")
END

#############################################
# OPENAI CHECK
#############################################

echo ""
echo "[10] Checking OpenAI connectivity..."

python3 << END
import os
import requests

key = os.getenv("OPENAI_API_KEY")

if not key:
    print("⚠ OpenAI key not configured")
else:
    try:
        r = requests.get(
            "https://api.openai.com/v1/models",
            headers={"Authorization": f"Bearer {key}"}
        )
        if r.status_code == 200:
            print("✔ OpenAI API reachable")
        else:
            print("⚠ OpenAI API responded but returned", r.status_code)
    except Exception as e:
        print("❌ OpenAI connectivity failed:", e)
END

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
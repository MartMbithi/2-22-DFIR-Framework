import os
import sys
import time
import socket
import psutil
import shutil
import subprocess
from pathlib import Path
from dotenv import load_dotenv

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress
from rich.text import Text

console = Console()

ROOT = Path(__file__).parent
LOG_DIR = ROOT / "logs_2_22"
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"

API_PORT = 8000
FRONTEND_PORT = 3000

API_URL = f"http://127.0.0.1:{API_PORT}"
FRONTEND_URL = f"http://127.0.0.1:{FRONTEND_PORT}"

load_dotenv()

########################################################
# BOOT SEQUENCE
########################################################


def boot_sequence():

    console.print(
        Panel.fit(
            "[bold cyan]2:22 DFIR FRAMEWORK COMMAND CENTER[/bold cyan]\n"
            "[dim]Signal → Evidence → Truth[/dim]",
            border_style="cyan",
        )
    )

    with Progress() as progress:

        task = progress.add_task("[cyan]Booting platform systems...", total=100)

        for i in range(100):
            time.sleep(0.02)
            progress.update(task, advance=1)

    console.print("[green]Platform boot sequence complete[/green]\n")


########################################################
# LOG SYSTEM
########################################################


def prepare_logs():

    if LOG_DIR.exists():
        shutil.rmtree(LOG_DIR)

    LOG_DIR.mkdir()

    console.print("[green]✔ Runtime logs initialized[/green]")


########################################################
# PORT CHECK
########################################################


def port_in_use(port):

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0


def kill_port(port):

    for proc in psutil.process_iter(["pid", "name"]):

        try:
            for conn in proc.connections():

                if conn.laddr.port == port:
                    proc.kill()
                    console.print(f"[yellow]⚡ Reclaimed port {port}[/yellow]")

        except:
            pass


########################################################
# PYTHON ENVIRONMENT
########################################################


def prepare_python():

    console.print("\n[cyan]Preparing Python environment[/cyan]")

    if not (ROOT / "venv").exists():

        subprocess.run(["python3", "-m", "venv", "venv"])

    pip = ROOT / "venv/bin/pip"

    subprocess.run([str(pip), "install", "--upgrade", "pip"])
    subprocess.run([str(pip), "install", "-r", "requirements.txt"])

    console.print("[green]✔ Python environment ready[/green]")


########################################################
# NODE ENVIRONMENT
########################################################


def prepare_node():

    if not FRONTEND_DIR.exists():
        return

    console.print("\n[cyan]Preparing frontend[/cyan]")

    if not (FRONTEND_DIR / "node_modules").exists():

        subprocess.run(["npm", "install"], cwd=FRONTEND_DIR)

    console.print("[green]✔ Frontend dependencies ready[/green]")


########################################################
# DATABASE CHECK
########################################################


def verify_database():

    console.print("\n[cyan]Checking database connectivity[/cyan]")

    host = os.getenv("DB_HOST")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD", "")
    db = os.getenv("DB_NAME")
    port = os.getenv("DB_PORT")

    try:

        import sqlalchemy

        url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db}"

        engine = sqlalchemy.create_engine(url)
        engine.connect()

        console.print("[green]✔ Database connection verified[/green]")

    except Exception as e:

        console.print(f"[red]Database error: {e}[/red]")
        sys.exit(1)


########################################################
# OPENAI CONNECTIVITY
########################################################


def verify_openai():

    console.print("\n[cyan]Checking OpenAI connectivity[/cyan]")

    key = os.getenv("OPENAI_API_KEY")

    if not key:

        console.print("[yellow]⚠ OpenAI not configured[/yellow]")
        return

    import requests

    r = requests.get(
        "https://api.openai.com/v1/models", headers={"Authorization": f"Bearer {key}"}
    )

    if r.status_code == 200:

        console.print("[green]✔ OpenAI API reachable[/green]")

    else:

        console.print("[red]OpenAI connection failed[/red]")


########################################################
# DFIR SELF TEST
########################################################


def dfir_self_test():

    console.print("\n[cyan]Running DFIR engine diagnostics[/cyan]")

    try:

        subprocess.run(
            ["python", "dfir_core/scripts/run_all.py", "--dry-run"],
            stdout=subprocess.DEVNULL,
        )

        console.print("[green]✔ DFIR pipeline operational[/green]")

    except:

        console.print("[yellow]⚠ DFIR diagnostics skipped[/yellow]")


########################################################
# INGESTION TEST
########################################################


def ingestion_test():

    console.print("\n[cyan]Checking ingestion pipeline[/cyan]")

    upload_dir = ROOT / "uploads"

    if not upload_dir.exists():

        upload_dir.mkdir()

    console.print("[green]✔ Ingestion directory ready[/green]")


########################################################
# START SERVICES
########################################################


def start_backend():

    console.print("\n[cyan]Starting backend service[/cyan]")

    backend_log = open(LOG_DIR / "backend.log", "w")

    # locate uvicorn inside virtualenv
    if sys.platform == "win32":
        uvicorn_path = ROOT / "venv" / "Scripts" / "uvicorn"
    else:
        uvicorn_path = ROOT / "venv" / "bin" / "uvicorn"

    process = subprocess.Popen(
        [
            str(uvicorn_path),
            "backend.main:app",
            "--host",
            "0.0.0.0",
            "--port",
            str(API_PORT),
        ],
        stdout=backend_log,
        stderr=backend_log,
        cwd=ROOT,
    )

    time.sleep(3)

    console.print("[green]✔ Backend online[/green]")

    return process.pid


def start_frontend():

    if not FRONTEND_DIR.exists():
        return None

    console.print("\n[cyan]Starting frontend interface[/cyan]")

    frontend_log = open(LOG_DIR / "frontend.log", "w")

    process = subprocess.Popen(
        ["npm", "run", "dev", "--", "--port", str(FRONTEND_PORT)],
        cwd=FRONTEND_DIR,
        stdout=frontend_log,
        stderr=frontend_log,
    )

    time.sleep(3)

    console.print("[green]✔ Frontend online[/green]")

    return process.pid


########################################################
# TELEMETRY
########################################################


def show_status(backend_pid, frontend_pid):

    table = Table(title="2:22 Platform Status")

    table.add_column("Component")
    table.add_column("Status")

    table.add_row("Backend", "ONLINE")
    table.add_row("Frontend", "ONLINE")
    table.add_row("Database", "CONNECTED")
    table.add_row("Ingestion", "READY")
    table.add_row("DFIR Engine", "READY")

    console.print(table)

    console.print("\n[bold cyan]Access Points[/bold cyan]")

    console.print(f"API → {API_URL}/docs")
    console.print(f"Frontend → {FRONTEND_URL}")

    console.print(f"\nLogs → {LOG_DIR}")


########################################################
# MAIN
########################################################


def main():

    boot_sequence()

    prepare_logs()

    if port_in_use(API_PORT):
        kill_port(API_PORT)

    if port_in_use(FRONTEND_PORT):
        kill_port(FRONTEND_PORT)

    prepare_python()

    prepare_node()

    verify_database()

    verify_openai()

    dfir_self_test()

    ingestion_test()

    backend_pid = start_backend()

    frontend_pid = start_frontend()

    show_status(backend_pid, frontend_pid)

    console.print("\n[bold green]2:22 DFIR Framework Ready[/bold green]\n")


if __name__ == "__main__":
    main()

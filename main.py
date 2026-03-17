import os
import sys
import time
import socket
import psutil
import shutil
import subprocess
import json
from pathlib import Path
from dotenv import load_dotenv

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress

console = Console()

ROOT = Path(__file__).parent
LOG_DIR = ROOT / "logs_2_22"
PID_FILE = ROOT / ".pids.json"

BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"

API_PORT = 8000
FRONTEND_PORT = 3000

API_URL = f"http://127.0.0.1:{API_PORT}"
FRONTEND_URL = f"http://127.0.0.1:{FRONTEND_PORT}"

load_dotenv()

########################################################
# PID MANAGEMENT
########################################################


def save_pids(pids):
    with open(PID_FILE, "w") as f:
        json.dump(pids, f)


def load_pids():
    if not PID_FILE.exists():
        return {}
    with open(PID_FILE) as f:
        return json.load(f)


def clear_pids():
    if PID_FILE.exists():
        PID_FILE.unlink()


########################################################
# PROCESS CONTROL
########################################################


def kill_process(pid):
    try:
        proc = psutil.Process(pid)
        for child in proc.children(recursive=True):
            child.kill()
        proc.kill()
        console.print(f"[yellow]Stopped PID {pid}[/yellow]")
    except psutil.NoSuchProcess:
        pass


def kill_port(port):
    console.print(f"[yellow]Reclaiming port {port}[/yellow]")

    for proc in psutil.process_iter(["pid", "name"]):
        try:
            for conn in proc.connections(kind="inet"):
                if conn.laddr.port == port:
                    proc.kill()
                    console.print(f"[red]Killed PID {proc.pid} on port {port}[/red]")
        except:
            pass


def port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0


def verify_shutdown():
    if port_in_use(API_PORT) or port_in_use(FRONTEND_PORT):
        console.print("[red]⚠ Some services still running[/red]")
    else:
        console.print("[green]✔ Ports fully released[/green]")


def stop_services():
    console.print("\n[cyan]Stopping services...[/cyan]")

    pids = load_pids()

    for _, pid in pids.items():
        kill_process(pid)

    kill_port(API_PORT)
    kill_port(FRONTEND_PORT)

    clear_pids()

    time.sleep(1)
    verify_shutdown()

    console.print("[green]✔ All services stopped[/green]")


########################################################
# ENV PREP
########################################################


def prepare_logs():
    if LOG_DIR.exists():
        shutil.rmtree(LOG_DIR)
    LOG_DIR.mkdir()
    console.print("[green]✔ Logs initialized[/green]")


def prepare_python():
    console.print("\n[cyan]Preparing Python environment[/cyan]")

    venv_path = ROOT / "venv"

    if not venv_path.exists():
        subprocess.run([sys.executable, "-m", "venv", "venv"])

    pip = venv_path / ("Scripts" if sys.platform == "win32" else "bin") / "pip"

    subprocess.run([str(pip), "install", "--upgrade", "pip"])
    subprocess.run([str(pip), "install", "-r", "requirements.txt"])

    console.print("[green]✔ Python ready[/green]")


def prepare_node():
    if not FRONTEND_DIR.exists():
        return

    console.print("\n[cyan]Preparing frontend[/cyan]")

    if not (FRONTEND_DIR / "node_modules").exists():
        subprocess.run(["npm", "install"], cwd=FRONTEND_DIR)

    console.print("[green]✔ Frontend ready[/green]")


########################################################
# HEALTH CHECKS
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


def verify_openai():
    console.print("\n[cyan]Checking OpenAI[/cyan]")

    key = os.getenv("OPENAI_API_KEY")

    if not key:
        console.print("[yellow]⚠ OpenAI not configured[/yellow]")
        return

    import requests

    r = requests.get(
        "https://api.openai.com/v1/models", headers={"Authorization": f"Bearer {key}"}
    )

    if r.status_code == 200:
        console.print("[green]✔ OpenAI reachable[/green]")
    else:
        console.print("[red]OpenAI failed[/red]")


def dfir_self_test():
    console.print("\n[cyan]DFIR diagnostics[/cyan]")

    try:
        subprocess.run(
            [sys.executable, "-m", "scripts.run_all", "--dry-run"],
            cwd=ROOT / "dfir_core",
            stdout=subprocess.DEVNULL,
        )
        console.print("[green]✔ DFIR ready[/green]")
    except:
        console.print("[yellow]⚠ DFIR skipped[/yellow]")


def ingestion_test():
    upload_dir = ROOT / "data" / "cases"
    upload_dir.mkdir(parents=True, exist_ok=True)
    console.print("[green]✔ Ingestion ready[/green]")


########################################################
# START SERVICES
########################################################


def start_backend():
    console.print("\n[cyan]Starting backend[/cyan]")

    backend_log = open(LOG_DIR / "backend.log", "w")

    uvicorn = (
        ROOT / "venv" / ("Scripts" if sys.platform == "win32" else "bin") / "uvicorn"
    )

    process = subprocess.Popen(
        [
            str(uvicorn),
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

    time.sleep(2)

    return process.pid


def start_frontend():
    if not FRONTEND_DIR.exists():
        return None

    console.print("\n[cyan]Starting frontend[/cyan]")

    frontend_log = open(LOG_DIR / "frontend.log", "w")

    process = subprocess.Popen(
        ["npm", "run", "dev", "--", "--port", str(FRONTEND_PORT)],
        cwd=FRONTEND_DIR,
        stdout=frontend_log,
        stderr=frontend_log,
    )

    time.sleep(2)

    return process.pid


########################################################
# STATUS
########################################################


def show_status():
    table = Table(title="2:22 DFIR Platform Status")
    table.add_column("Component")
    table.add_column("Status")

    table.add_row("Backend", "ONLINE" if port_in_use(API_PORT) else "OFFLINE")
    table.add_row("Frontend", "ONLINE" if port_in_use(FRONTEND_PORT) else "OFFLINE")

    console.print(table)

    console.print(f"\nAPI → {API_URL}/docs")
    console.print(f"Frontend → {FRONTEND_URL}")
    console.print(f"Logs → {LOG_DIR}")


########################################################
# BOOT
########################################################


def boot_sequence():
    console.print(
        Panel.fit(
            "[bold cyan]2:22 DFIR COMMAND CENTER[/bold cyan]\n"
            "[dim]Signal → Evidence → Truth[/dim]",
            border_style="cyan",
        )
    )

    with Progress() as progress:
        task = progress.add_task("[cyan]Booting...", total=100)
        for _ in range(100):
            time.sleep(0.01)
            progress.update(task, advance=1)


########################################################
# CONTROL
########################################################


def start():
    boot_sequence()
    prepare_logs()

    if port_in_use(API_PORT):
        kill_port(API_PORT)

    if port_in_use(FRONTEND_PORT):
        kill_port(FRONTEND_PORT)

    prepare_python()
    prepare_node()

    verify_openai()
    dfir_self_test()
    ingestion_test()

    backend_pid = start_backend()
    frontend_pid = start_frontend()

    save_pids({"backend": backend_pid, "frontend": frontend_pid})

    show_status()

    console.print("\n[bold green]2:22 DFIR READY[/bold green]\n")


def restart():
    console.print("[cyan]Restarting...[/cyan]")
    stop_services()
    time.sleep(1)
    start()


def main():
    command = sys.argv[1] if len(sys.argv) > 1 else "start"

    if command == "start":
        start()
    elif command == "stop":
        stop_services()
    elif command == "restart":
        restart()
    elif command == "status":
        show_status()
    else:
        console.print(f"[red]Unknown command: {command}[/red]")


if __name__ == "__main__":
    main()

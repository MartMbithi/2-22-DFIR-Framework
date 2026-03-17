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


def stop_services():

    console.print("\n[cyan]Stopping services...[/cyan]")

    pids = load_pids()

    if not pids:
        console.print("[yellow]No running services found[/yellow]")
        return

    for name, pid in pids.items():
        kill_process(pid)

    clear_pids()

    console.print("[green]✔ All services stopped[/green]")


########################################################
# PORT UTIL
########################################################


def port_in_use(port):

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0


########################################################
# START SERVICES
########################################################


def start_backend():

    console.print("\n[cyan]Starting backend[/cyan]")

    backend_log = open(LOG_DIR / "backend.log", "w")

    uvicorn_path = (
        ROOT / "venv" / ("Scripts" if sys.platform == "win32" else "bin") / "uvicorn"
    )

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

    time.sleep(2)

    console.print("[green]✔ Backend online[/green]")

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

    console.print("[green]✔ Frontend online[/green]")

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


def prepare_logs():

    if LOG_DIR.exists():
        shutil.rmtree(LOG_DIR)

    LOG_DIR.mkdir()


########################################################
# MAIN CONTROL
########################################################


def start():

    boot_sequence()
    prepare_logs()

    backend_pid = start_backend()
    frontend_pid = start_frontend()

    save_pids({"backend": backend_pid, "frontend": frontend_pid})

    show_status()

    console.print("\n[bold green]System Ready[/bold green]\n")


def restart():

    console.print("[cyan]Restarting system...[/cyan]")
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

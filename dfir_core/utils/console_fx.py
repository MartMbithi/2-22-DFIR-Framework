# 2:22 DFIR Framework — Console Display Effects
import sys
import time


def safe_print(msg: str):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode("ascii", "replace").decode())


def holo_print(msg: str):
    safe_print(f"  >>> {msg}")


def pulse(msg: str):
    safe_print(f"  ... {msg}")


def stage(name: str):
    bar = "=" * 56
    safe_print(f"\n  {bar}")
    safe_print(f"   STAGE: {name}")
    safe_print(f"  {bar}")


def ok(msg: str):
    holo_print(f"[OK] {msg}")


def fail(msg: str):
    holo_print(f"[FAIL] {msg}")


def timing(label: str, start: float):
    elapsed = time.time() - start
    safe_print(f"   [TIME] {label} completed in {elapsed:.2f}s")


def progress_bar(current: int, total: int, prefix: str = "", width: int = 40):
    if total == 0:
        return
    pct = current / total
    filled = int(width * pct)
    bar = "#" * filled + "-" * (width - filled)
    sys.stdout.write(f"\r  {prefix} [{bar}] {pct:.0%}")
    if current >= total:
        sys.stdout.write("\n")
    sys.stdout.flush()

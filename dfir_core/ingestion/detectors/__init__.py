# 2:22 DFIR Framework — Detector Registry
from .web_attack_detector import WebAttackDetector
from .auth_detector import AuthDetector
from .network_detector import NetworkDetector
from .process_detector import ProcessDetector
from .system_detector import SystemDetector
from .file_detector import FileDetector

__all__ = [
    "WebAttackDetector",
    "AuthDetector",
    "NetworkDetector",
    "ProcessDetector",
    "SystemDetector",
    "FileDetector",
]

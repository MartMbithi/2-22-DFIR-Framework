# 2:22 DFIR Framework — Base Detector Interface
from abc import ABC, abstractmethod


class BaseDetector(ABC):
    """
    Abstract base for all forensic log detectors.
    Each detector identifies a specific class of security-relevant events
    from raw log lines and parses them into normalized artifact dicts.
    """

    @abstractmethod
    def matches(self, line: str) -> bool:
        """Return True if this detector recognizes the log line."""
        raise NotImplementedError

    @abstractmethod
    def parse(self, line: str, context: dict) -> dict:
        """
        Parse a matched log line into a normalized forensic artifact dict.
        Context includes: case_id, file, host, line_number
        """
        raise NotImplementedError

    @property
    def detector_name(self) -> str:
        return self.__class__.__name__

# 2:22 DFIR Framework — UUID Utilities
import uuid


def GenerateArtifactId() -> str:
    return str(uuid.uuid4())


def GenerateCaseId() -> str:
    return f"CASE-{uuid.uuid4().hex[:8].upper()}"

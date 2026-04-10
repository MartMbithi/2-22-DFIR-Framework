# 2:22 DFIR Framework — Artifact Store
# Persists normalized forensic artifacts to the database

import json
import mysql.connector


class ArtifactStore:
    def __init__(self, **db_config):
        self.connection = mysql.connector.connect(**db_config)
        self.cursor = self.connection.cursor()

    def InsertArtifact(self, artifact: dict):
        query = """
        INSERT IGNORE INTO forensic_artifacts (
            artifact_id, case_id, artifact_type, source_tool,
            source_file, host_id, user_context,
            artifact_timestamp, artifact_path,
            content_summary, raw_content,
            md5, sha1, sha256, metadata, ingested_at
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """
        metadata = artifact.get("metadata") or {}
        if not isinstance(metadata, str):
            metadata = json.dumps(metadata)

        values = (
            artifact["artifact_id"],
            artifact["case_id"],
            artifact.get("artifact_type"),
            artifact.get("source_tool"),
            artifact.get("source_file"),
            artifact.get("host_id"),
            artifact.get("user_context"),
            artifact.get("artifact_timestamp"),
            artifact.get("artifact_path"),
            artifact.get("content_summary"),
            artifact.get("raw_content"),
            artifact.get("md5"),
            artifact.get("sha1"),
            artifact.get("sha256"),
            metadata,
            artifact.get("ingested_at"),
        )
        self.cursor.execute(query, values)
        self.connection.commit()

    def InsertBatch(self, artifacts: list[dict]):
        for a in artifacts:
            self.InsertArtifact(a)

    def close(self):
        try:
            self.cursor.close()
            self.connection.close()
        except Exception:
            pass

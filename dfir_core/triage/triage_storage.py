# 2:22 DFIR Framework — Triage Storage
# Persists triage results to the forensic database for audit trail

import json
import mysql.connector


class TriageStore:
    def __init__(self, **db_config):
        self.connection = mysql.connector.connect(**db_config)
        self.cursor = self.connection.cursor()

    def InsertTriageResult(self, result: dict):
        query = """
        INSERT INTO triage_results (artifact_id, triage_score, score_breakdown, triaged_at)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            triage_score = VALUES(triage_score),
            score_breakdown = VALUES(score_breakdown),
            triaged_at = VALUES(triaged_at)
        """
        breakdown = result.get("score_breakdown", {})
        if not isinstance(breakdown, str):
            breakdown = json.dumps(breakdown)

        values = (
            result["artifact_id"],
            result["triage_score"],
            breakdown,
            result["triaged_at"],
        )
        self.cursor.execute(query, values)
        self.connection.commit()

    def close(self):
        try:
            self.cursor.close()
            self.connection.close()
        except Exception:
            pass

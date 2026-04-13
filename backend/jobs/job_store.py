from __future__ import annotations

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sqlite3
from threading import RLock
from typing import Any, Literal
from uuid import uuid4


JobStatus = Literal["pending", "running", "done", "failed"]
JobBackend = Literal["aer", "ibm"]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _job_mode(metadata: dict[str, Any] | None) -> Literal["1q", "2q"]:
    mode = str((metadata or {}).get("mode", "1q")).lower()
    return "2q" if mode == "2q" else "1q"


class JobStore:
    def __init__(self, db_path: str | None = None) -> None:
        resolved = (db_path or os.getenv("JOB_STORE_DB_PATH") or "backend/jobs/job_store.sqlite").strip()
        self._db_path = resolved
        self._lock = RLock()
        self._conn = self._open_connection(resolved)
        self._init_schema()

    def _open_connection(self, db_path: str) -> sqlite3.Connection:
        if db_path != ":memory:":
            Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_schema(self) -> None:
        with self._lock:
            self._conn.execute(
                """
                CREATE TABLE IF NOT EXISTS jobs (
                    job_id TEXT PRIMARY KEY,
                    status TEXT NOT NULL,
                    backend TEXT NOT NULL,
                    mode TEXT NOT NULL,
                    alpha REAL NOT NULL,
                    shots INTEGER NOT NULL,
                    result_json TEXT,
                    metadata_json TEXT NOT NULL,
                    error TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            self._conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_jobs_updated_at ON jobs(updated_at DESC)"
            )
            self._conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_jobs_status_backend_mode ON jobs(status, backend, mode)"
            )
            self._conn.commit()

    def _row_to_dict(self, row: sqlite3.Row) -> dict[str, Any]:
        metadata_raw = row["metadata_json"]
        result_raw = row["result_json"]
        metadata = json.loads(metadata_raw) if metadata_raw else {}
        result = json.loads(result_raw) if result_raw else None
        return {
            "job_id": row["job_id"],
            "status": row["status"],
            "backend": row["backend"],
            "alpha": float(row["alpha"]),
            "shots": int(row["shots"]),
            "result": result,
            "metadata": metadata,
            "error": row["error"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }

    def create_job(
        self,
        alpha: float,
        shots: int,
        backend: JobBackend,
        metadata: dict[str, Any] | None = None,
    ) -> str:
        job_id = str(uuid4())
        created_at = _now_iso()
        payload_metadata = metadata or {}
        mode = _job_mode(payload_metadata)

        with self._lock:
            self._conn.execute(
                """
                INSERT INTO jobs (
                    job_id, status, backend, mode, alpha, shots,
                    result_json, metadata_json, error, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    job_id,
                    "pending",
                    backend,
                    mode,
                    float(alpha),
                    int(shots),
                    None,
                    json.dumps(payload_metadata),
                    None,
                    created_at,
                    created_at,
                ),
            )
            self._conn.commit()
        return job_id

    def update_job(
        self,
        job_id: str,
        *,
        status: JobStatus | None = None,
        result: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
        error: str | None = None,
    ) -> dict[str, Any] | None:
        updates: list[str] = []
        params: list[Any] = []

        if status is not None:
            updates.append("status = ?")
            params.append(status)
        if result is not None:
            updates.append("result_json = ?")
            params.append(json.dumps(result))
        if metadata is not None:
            updates.append("metadata_json = ?")
            params.append(json.dumps(metadata))
            updates.append("mode = ?")
            params.append(_job_mode(metadata))
        if error is not None:
            updates.append("error = ?")
            params.append(error)

        if not updates:
            return self.get_job(job_id)

        updates.append("updated_at = ?")
        params.append(_now_iso())
        params.append(job_id)

        with self._lock:
            cursor = self._conn.execute(
                f"UPDATE jobs SET {', '.join(updates)} WHERE job_id = ?",
                params,
            )
            if cursor.rowcount == 0:
                return None

            self._conn.commit()
            row = self._conn.execute(
                "SELECT * FROM jobs WHERE job_id = ?",
                (job_id,),
            ).fetchone()
            if row is None:
                return None
            return self._row_to_dict(row)

    def get_job(self, job_id: str) -> dict[str, Any] | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT * FROM jobs WHERE job_id = ?",
                (job_id,),
            ).fetchone()
            return self._row_to_dict(row) if row else None

    def list_jobs(
        self,
        *,
        limit: int = 50,
        offset: int = 0,
        status: JobStatus | None = None,
        backend: JobBackend | None = None,
        mode: Literal["1q", "2q"] | None = None,
    ) -> tuple[list[dict[str, Any]], int]:
        safe_limit = max(1, int(limit))
        safe_offset = max(0, int(offset))

        where_parts: list[str] = []
        where_params: list[Any] = []
        if status is not None:
            where_parts.append("status = ?")
            where_params.append(status)
        if backend is not None:
            where_parts.append("backend = ?")
            where_params.append(backend)
        if mode is not None:
            where_parts.append("mode = ?")
            where_params.append(mode)

        where_clause = f"WHERE {' AND '.join(where_parts)}" if where_parts else ""

        with self._lock:
            total = int(
                self._conn.execute(
                    f"SELECT COUNT(*) FROM jobs {where_clause}",
                    where_params,
                ).fetchone()[0]
            )

            rows = self._conn.execute(
                f"""
                SELECT *
                FROM jobs
                {where_clause}
                ORDER BY datetime(created_at) DESC
                LIMIT ? OFFSET ?
                """,
                [*where_params, safe_limit, safe_offset],
            ).fetchall()

            return ([self._row_to_dict(row) for row in rows], total)


job_store = JobStore()

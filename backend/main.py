from pathlib import Path

import duckdb
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Compass Analytics API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT_ROOT / "compass_analytics" / "compass.duckdb"


def query_database(sql: str) -> list[dict]:
    """Execute a read-only query and return rows as dictionaries."""
    with duckdb.connect(str(DB_PATH), read_only=True) as connection:
        cursor = connection.execute(sql)
        columns = [column[0] for column in cursor.description]
        return [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]


@app.get("/")
def root():
    return {"message": "Compass Analytics API is running"}


@app.get("/api/grants")
def get_grants():
    return query_database("""
        SELECT *
        FROM main.stg_grants
        ORDER BY grant_id
    """)


@app.get("/api/funding-summary")
def get_funding_summary():
    return query_database("""
        SELECT *
        FROM main.funding_summary
        ORDER BY programme, region
    """)

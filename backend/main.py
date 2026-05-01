from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.errors import register_exception_handlers
from backend.routers import ibm, run, sweep

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s  %(name)s  %(message)s",
)

app = FastAPI(title="Quantum Simulation Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(sweep.router)
app.include_router(run.router)
app.include_router(ibm.router)
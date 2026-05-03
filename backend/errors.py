from __future__ import annotations

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel


def _json_safe(value: object) -> object:
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    if isinstance(value, list):
        return [_json_safe(item) for item in value]
    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}
    return value


class ApiError(BaseModel):
    code: str
    message: str
    details: dict | list | str | None = None


class ApiErrorResponse(BaseModel):
    error: ApiError


def error_payload(code: str, message: str, details: dict | list | str | None = None) -> dict:
    return ApiErrorResponse(
        error=ApiError(code=code, message=message, details=details)
    ).model_dump()


def raise_api_error(
    status_code: int,
    code: str,
    message: str,
    details: dict | list | str | None = None,
) -> None:
    raise HTTPException(
        status_code=status_code,
        detail=error_payload(code=code, message=message, details=details),
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        _request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        safe_details = _json_safe(exc.errors())
        return JSONResponse(
            status_code=422,
            content=error_payload(
                code="validation-error",
                message="Request validation failed.",
                details=safe_details,
            ),
        )

    @app.exception_handler(HTTPException)
    async def handle_http_error(_request: Request, exc: HTTPException) -> JSONResponse:
        if isinstance(exc.detail, dict) and "error" in exc.detail:
            return JSONResponse(status_code=exc.status_code, content=exc.detail)

        return JSONResponse(
            status_code=exc.status_code,
            content=error_payload(
                code="http-error",
                message=str(exc.detail),
            ),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(_request: Request, _exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content=error_payload(
                code="internal-error",
                message="Unexpected server error.",
            ),
        )

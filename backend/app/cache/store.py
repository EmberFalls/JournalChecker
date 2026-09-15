"""Small fail-closed Redis cache with an in-process fallback for local development."""
import json
import time
from functools import lru_cache
from typing import Any
import redis.asyncio as redis
from app.core.config import get_settings


class Cache:
    def __init__(self, redis_url: str | None = None) -> None:
        self._memory: dict[str, tuple[float, Any]] = {}
        self._client = redis.from_url(redis_url, decode_responses=True) if redis_url else None

    async def get(self, key: str) -> Any | None:
        now = time.monotonic()
        memory = self._memory.get(key)
        if memory and memory[0] > now:
            return memory[1]
        if memory:
            del self._memory[key]
        if self._client:
            try:
                value = await self._client.get(key)
                return json.loads(value) if value is not None else None
            except redis.RedisError:
                # Cache unavailability must never block evidence collection.
                self._client = None
        return None

    async def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        self._memory[key] = (time.monotonic() + ttl_seconds, value)
        if self._client:
            try:
                await self._client.set(key, json.dumps(value), ex=ttl_seconds)
            except redis.RedisError:
                self._client = None


@lru_cache
def get_cache() -> Cache:
    return Cache(get_settings().redis_url)


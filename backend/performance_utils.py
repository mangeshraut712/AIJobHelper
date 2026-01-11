"""
Performance optimization utilities for the backend.
"""
from functools import lru_cache
from typing import Any, Callable
import time
import logging

logger = logging.getLogger(__name__)


def timing_decorator(func: Callable) -> Callable:
    """Decorator to measure function execution time."""
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start
        logger.debug(f"{func.__name__} took {duration:.3f}s")
        return result
    return wrapper


@lru_cache(maxsize=128)
def cached_prompt_builder(template: str, *args) -> str:
    """Cache frequently used prompt templates."""
    return template.format(*args)


class PerformanceMonitor:
    """Monitor API endpoint performance."""
    
    def __init__(self):
        self.metrics = {}
    
    def record(self, endpoint: str, duration: float):
        """Record endpoint execution time."""
        if endpoint not in self.metrics:
            self.metrics[endpoint] = []
        self.metrics[endpoint].append(duration)
    
    def get_average(self, endpoint: str) -> float:
        """Get average execution time for endpoint."""
        if endpoint not in self.metrics or not self.metrics[endpoint]:
            return 0.0
        return sum(self.metrics[endpoint]) / len(self.metrics[endpoint])
    
    def get_stats(self, endpoint: str) -> dict:
        """Get detailed stats for endpoint."""
        if endpoint not in self.metrics or not self.metrics[endpoint]:
            return {"count": 0, "avg": 0.0, "min": 0.0, "max": 0.0}
        
        times = self.metrics[endpoint]
        return {
            "count": len(times),
            "avg": sum(times) / len(times),
            "min": min(times),
            "max": max(times),
        }


# Global performance monitor instance
perf_monitor = PerformanceMonitor()

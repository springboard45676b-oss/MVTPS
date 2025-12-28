import time
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import requests
from requests.exceptions import RequestException, Timeout, HTTPError


class RateLimiter:
    """Simple rate limiter using token bucket algorithm."""
    
    def __init__(self, max_calls: int = 60, period: int = 60):
        """
        Args:
            max_calls: Maximum number of calls allowed
            period: Time period in seconds
        """
        self.max_calls = max_calls
        self.period = period
        self.calls = []
    
    def wait_if_needed(self):
        """Wait if rate limit would be exceeded."""
        now = time.time()
        # Remove calls older than the period
        self.calls = [call_time for call_time in self.calls if now - call_time < self.period]
        
        if len(self.calls) >= self.max_calls:
            # Wait until the oldest call expires
            sleep_time = self.period - (now - self.calls[0]) + 0.1
            if sleep_time > 0:
                time.sleep(sleep_time)
                # Clean up again after sleep
                now = time.time()
                self.calls = [call_time for call_time in self.calls if now - call_time < self.period]
        
        self.calls.append(time.time())


class AISServiceBase(ABC):
    """Base class for AIS service providers."""
    
    def __init__(self, api_key: Optional[str] = None, rate_limit_calls: int = 60, rate_limit_period: int = 60):
        """
        Args:
            api_key: API key for the service (if None, will read from env)
            rate_limit_calls: Maximum API calls per period
            rate_limit_period: Period in seconds for rate limiting
        """
        self.api_key = api_key or self._get_api_key()
        self.rate_limiter = RateLimiter(max_calls=rate_limit_calls, period=rate_limit_period)
    
    @abstractmethod
    def _get_api_key(self) -> str:
        """Get API key from environment variables."""
        pass
    
    @abstractmethod
    def get_vessel_by_mmsi(self, mmsi: str) -> Dict[str, Any]:
        """
        Fetch vessel data by MMSI.
        
        Args:
            mmsi: MMSI number
            
        Returns:
            Normalized vessel data dict with keys:
            mmsi, imo, name, lat, lon, speed, course, heading, flag, vessel_type, last_update
            
        Raises:
            ValueError: If MMSI is invalid
            requests.RequestException: If API request fails
        """
        pass
    
    @abstractmethod
    def get_vessel_by_imo(self, imo: str) -> Dict[str, Any]:
        """
        Fetch vessel data by IMO.
        
        Args:
            imo: IMO number
            
        Returns:
            Normalized vessel data dict with keys:
            mmsi, imo, name, lat, lon, speed, course, heading, flag, vessel_type, last_update
            
        Raises:
            ValueError: If IMO is invalid
            requests.RequestException: If API request fails
        """
        pass
    
    def _make_request(self, url: str, params: Dict[str, Any], timeout: int = 10) -> Dict[str, Any]:
        """
        Make HTTP request with rate limiting and error handling.
        
        Args:
            url: API endpoint URL
            params: Query parameters
            timeout: Request timeout in seconds
            
        Returns:
            JSON response data
            
        Raises:
            ValueError: If API key is missing or request parameters are invalid
            requests.RequestException: If request fails
        """
        if not self.api_key:
            raise ValueError(f"API key not configured for {self.__class__.__name__}")
        
        # Apply rate limiting
        self.rate_limiter.wait_if_needed()
        
        try:
            response = requests.get(url, params=params, timeout=timeout)
            
            # Handle rate limiting errors
            if response.status_code == 429:
                # Wait and retry once
                time.sleep(2)
                self.rate_limiter.wait_if_needed()
                response = requests.get(url, params=params, timeout=timeout)
            
            response.raise_for_status()
            return response.json()
            
        except Timeout:
            raise RequestException(f"Request timeout for {self.__class__.__name__}")
        except HTTPError as e:
            if e.response.status_code == 404:
                raise ValueError(f"Vessel not found")
            elif e.response.status_code == 401:
                raise ValueError(f"Invalid API key for {self.__class__.__name__}")
            elif e.response.status_code == 429:
                raise RequestException(f"Rate limit exceeded for {self.__class__.__name__}")
            else:
                raise RequestException(f"API error: {e.response.status_code} - {e.response.text}")
        except RequestException as e:
            raise RequestException(f"Request failed: {str(e)}")
    
    @staticmethod
    def _safe_float(value: Any, default: Optional[float] = None) -> Optional[float]:
        """Safely convert value to float."""
        if value is None or value == "":
            return default
        try:
            return float(value)
        except (ValueError, TypeError):
            return default
    
    @staticmethod
    def _safe_int(value: Any, default: Optional[int] = None) -> Optional[int]:
        """Safely convert value to int."""
        if value is None or value == "":
            return default
        try:
            return int(value)
        except (ValueError, TypeError):
            return default
    
    @staticmethod
    def _safe_str(value: Any, default: Optional[str] = None) -> Optional[str]:
        """Safely convert value to string."""
        if value is None:
            return default
        return str(value).strip() or default


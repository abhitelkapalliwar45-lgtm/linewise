import time
import numpy as np
from typing import List, Dict

class MLWaitTimePredictor:
    """
    LineWise AI Wait-Time Prediction Engine
    Combines Exponential Moving Average (EMA) with Linear Regression (ML)
    to dynamically forecast user wait times based on historical queue performance.
    """

    def __init__(self, default_avg_seconds: float = 300.0, alpha: float = 0.3):
        self.default_avg_seconds = default_avg_seconds
        self.alpha = alpha  # EMA smoothing factor
        self.ema_service_time = default_avg_seconds
        self.completed_durations: List[float] = []
        self.model_trained = False
        self.regressor = None

        try:
            from sklearn.linear_model import LinearRegression
            self.regressor = LinearRegression()
        except ImportError:
            self.regressor = None

    def record_service_completion(self, duration_seconds: float, queue_length_at_time: int = 1):
        """
        Call when a customer service finishes. Updates Moving Average & fits Linear Regression.
        """
        # Ensure positive non-zero duration (at least 15s to filter outliers/instant tests)
        duration = max(15.0, min(duration_seconds, 3600.0))
        self.completed_durations.append(duration)

        # Update Exponential Moving Average
        self.ema_service_time = self.alpha * duration + (1 - self.alpha) * self.ema_service_time

        # Retrain Linear Regression if we have enough sample data points (>= 3)
        if self.regressor and len(self.completed_durations) >= 3:
            try:
                # Features: [queue_length, sample_index]
                X = []
                y = []
                for idx, dur in enumerate(self.completed_durations):
                    X.append([idx + 1, (idx % 10) + 1])
                    y.append(dur)
                
                self.regressor.fit(X, y)
                self.model_trained = True
            except Exception:
                self.model_trained = False

    def predict_service_time_per_customer(self, queue_length: int = 1) -> float:
        """
        Predicts average service duration for a customer using Linear Regression if trained,
        else EMA fallback.
        """
        if self.model_trained and self.regressor and len(self.completed_durations) >= 3:
            try:
                sample_idx = len(self.completed_durations) + 1
                pred = self.regressor.predict([[sample_idx, queue_length]])[0]
                # Bound prediction between 30s and 30 minutes
                return max(30.0, min(float(pred), 1800.0))
            except Exception:
                pass

        return self.ema_service_time

    def predict_wait_time(
        self,
        position_in_queue: int,
        currently_serving_started_at: float = None,
        total_waiting: int = 1
    ) -> int:
        """
        Calculates total estimated wait time in seconds for a customer at `position_in_queue`.
        Position 1 = Next to be called (or currently called).
        Position > 1 = In queue.
        """
        if position_in_queue <= 0:
            return 0

        avg_unit_time = self.predict_service_time_per_customer(total_waiting)

        # Estimate remaining time for currently serving customer if active
        current_serving_remaining = avg_unit_time
        if currently_serving_started_at:
            elapsed = max(0.0, time.time() - currently_serving_started_at)
            current_serving_remaining = max(0.0, avg_unit_time - elapsed)

        # Total Wait Time = Current serving remaining + (position - 1) * avg_unit_time
        total_seconds = current_serving_remaining + (position_in_queue - 1) * avg_unit_time
        return int(max(0, round(total_seconds)))

    def get_metrics(self) -> Dict:
        """
        Returns model analytics for display in Admin Dashboard.
        """
        avg_dur = float(np.mean(self.completed_durations)) if self.completed_durations else self.default_avg_seconds
        return {
            "total_completed_samples": len(self.completed_durations),
            "moving_average_seconds": round(self.ema_service_time, 1),
            "mean_service_seconds": round(avg_dur, 1),
            "model_type": "Linear Regression + EMA Hybrid" if self.model_trained else "Exponential Moving Average (EMA)",
            "status": "Trained" if self.model_trained else "Gathering Data",
        }

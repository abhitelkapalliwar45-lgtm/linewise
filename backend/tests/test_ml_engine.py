import pytest
from backend.ml_engine import MLWaitTimePredictor
from backend.database import format_wait_time, generate_qvc_otp

def test_initial_prediction_default():
    predictor = MLWaitTimePredictor(default_avg_seconds=300.0)
    assert predictor.ema_service_time == 300.0
    assert predictor.predict_service_time_per_customer(1) == 300.0
    assert predictor.predict_wait_time(position_in_queue=1) == 300
    assert predictor.predict_wait_time(position_in_queue=0) == 0

def test_wait_time_scaling_with_position():
    predictor = MLWaitTimePredictor(default_avg_seconds=120.0)
    # Position 1 = 120s
    assert predictor.predict_wait_time(1) == 120
    # Position 2 = 120s (serving) + 120s = 240s
    assert predictor.predict_wait_time(2) == 240
    # Position 3 = 120s + 2*120s = 360s
    assert predictor.predict_wait_time(3) == 360

def test_ema_updates_on_completion():
    predictor = MLWaitTimePredictor(default_avg_seconds=300.0, alpha=0.5)
    # Record a service that took 100 seconds
    predictor.record_service_completion(duration_seconds=100.0, queue_length_at_time=1)
    # EMA = 0.5 * 100 + 0.5 * 300 = 200
    assert predictor.ema_service_time == 200.0
    assert len(predictor.completed_durations) == 1

def test_linear_regression_training():
    predictor = MLWaitTimePredictor(default_avg_seconds=300.0)
    # Add multiple samples to trigger linear regression training (>= 3 samples)
    predictor.record_service_completion(150.0, 1)
    predictor.record_service_completion(160.0, 2)
    predictor.record_service_completion(170.0, 3)
    assert predictor.model_trained is True
    pred = predictor.predict_service_time_per_customer(queue_length=4)
    assert 30.0 <= pred <= 1800.0

def test_format_wait_time():
    assert format_wait_time(0) == "Now serving / Next"
    assert format_wait_time(-5) == "Now serving / Next"
    assert format_wait_time(45) == "45 sec"
    assert format_wait_time(120) == "2 min"
    assert format_wait_time(150) == "2 min 30 sec"

def test_generate_qvc_otp():
    for _ in range(50):
        otp = generate_qvc_otp()
        assert len(otp) == 4
        assert otp.isdigit()
        assert 1000 <= int(otp) <= 9999

def test_predictor_metrics():
    predictor = MLWaitTimePredictor(default_avg_seconds=240.0)
    metrics = predictor.get_metrics()
    assert metrics["total_completed_samples"] == 0
    assert metrics["status"] == "Gathering Data"
    
    predictor.record_service_completion(200.0, 1)
    predictor.record_service_completion(210.0, 2)
    predictor.record_service_completion(220.0, 3)
    metrics = predictor.get_metrics()
    assert metrics["total_completed_samples"] == 3
    assert metrics["status"] == "Trained"
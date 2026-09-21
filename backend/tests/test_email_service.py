import pytest
from unittest.mock import patch, MagicMock
from backend.config import config
from backend.email_service import _dispatch_email, send_ticket_confirmation_email, send_turn_called_email

def test_smtp_config():
    assert config.SMTP_USER == "abhitelkapalliwar45@gmail.com"
    assert config.SMTP_HOST == "smtp.gmail.com"
    assert config.SMTP_PORT == 587
    assert len(config.SMTP_PASSWORD) > 0

@patch("backend.email_service.smtplib.SMTP")
def test_dispatch_email(mock_smtp):
    mock_server = MagicMock()
    mock_smtp.return_value.__enter__.return_value = mock_server

    _dispatch_email(
        to_email="customer@example.com",
        subject="Test Subject",
        html_body="<h1>Hello HTML</h1>",
        text_body="Hello Text"
    )

    assert mock_server.starttls.called
    assert mock_server.login.called
    assert mock_server.send_message.called
    msg = mock_server.send_message.call_args[0][0]
    assert msg["To"] == "customer@example.com"
    payload = msg.get_payload()
    assert "Hello Text" in payload[0].get_payload(decode=True).decode("utf-8")
    assert "<h1>Hello HTML</h1>" in payload[1].get_payload(decode=True).decode("utf-8")

@patch("backend.email_service._dispatch_email")
def test_send_ticket_confirmation_email(mock_dispatch):
    send_ticket_confirmation_email(
        to_email="mayur@example.com",
        customer_name="Mayur",
        display_number="A-101",
        queue_name="Counter 1",
        position=1,
        wait_time="5 min",
        ticket_url="/ticket/LW-1/TKN-1"
    )
    # Give thread a moment to start
    import time
    time.sleep(0.1)
    assert mock_dispatch.called
    call_args = mock_dispatch.call_args[0]
    assert call_args[0] == "mayur@example.com"
    assert "A-101" in call_args[1]

@patch("backend.email_service._dispatch_email")
def test_send_turn_called_email(mock_dispatch):
    send_turn_called_email(
        to_email="abhi@example.com",
        customer_name="Abhishek",
        display_number="A-102",
        queue_name="Desk 1",
        qvc_otp="5821",
        ticket_url="/ticket/LW-1/TKN-2"
    )
    import time
    time.sleep(0.1)
    assert mock_dispatch.called
    call_args = mock_dispatch.call_args[0]
    assert call_args[0] == "abhi@example.com"
    assert "5821" in call_args[2]  # HTML body contains OTP
    assert "5821" in call_args[3]  # Text body contains OTP
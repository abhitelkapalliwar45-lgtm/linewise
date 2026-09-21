import smtplib
import ssl
import threading
from email.header import Header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from backend.config import config


def _dispatch_email(to_email: str, subject: str, html_body: str, text_body: str) -> None:
    """Internal synchronous function to send an email via SMTP."""
    if not to_email or not to_email.strip():
        return

    if not config.SMTP_PASSWORD:
        print(f"[EmailService] Notice: SMTP_PASSWORD is not configured in .env. Email to {to_email} was not sent.")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = Header(subject, "utf-8")
        msg["From"] = f"LineWise Queue Alerts <{config.SMTP_USER}>"
        msg["To"] = to_email

        part1 = MIMEText(text_body, "plain", "utf-8")
        part2 = MIMEText(html_body, "html", "utf-8")

        msg.attach(part1)
        msg.attach(part2)

        context = ssl.create_default_context()
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=10) as server:
            server.starttls(context=context)
            server.login(config.SMTP_USER, config.SMTP_PASSWORD)
            server.send_message(msg)

        print(f"[EmailService] Successfully sent email to {to_email}")
    except Exception as e:
        print(f"[EmailService] Warning: Failed to send email to {to_email}: {e}")


def send_ticket_confirmation_email(
    to_email: str,
    customer_name: str,
    display_number: str,
    queue_name: str,
    position: int,
    wait_time: str,
    ticket_url: Optional[str] = None
) -> None:
    """Dispatches a confirmation email when a user joins the queue (in background thread)."""
    if not to_email:
        return

    subject = f"🎟️ Token Confirmed: {display_number} - {queue_name}"
    
    text_body = f"""Hello {customer_name},

You have successfully joined the line at {queue_name}!

Your Token Number: {display_number}
Position in Line: #{position}
Estimated Wait Time: {wait_time}

Track your live position in real-time:
{ticket_url or 'Please check your live ticket screen'}

Thank you for using LineWise Smart Queue System!
"""

    html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }}
    .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
    .header {{ background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px 24px; text-align: center; color: #ffffff; }}
    .content {{ padding: 32px 28px; }}
    .token-box {{ background: #eff6ff; border: 2px dashed #93c5fd; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }}
    .token-num {{ font-size: 42px; font-weight: 900; color: #1d4ed8; letter-spacing: -1px; margin: 6px 0; }}
    .stats-row {{ display: flex; justify-content: space-around; margin: 20px 0; padding: 16px; background: #f8fafc; border-radius: 12px; }}
    .btn {{ display: block; text-align: center; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 15px; margin-top: 24px; }}
    .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 style="margin:0; font-size: 24px; font-weight: 800;">⚡ LineWise Queue Confirmation</h1>
      <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">{queue_name}</p>
    </div>
    <div class="content">
      <p style="font-size: 16px; margin: 0;">Hello <strong>{customer_name}</strong>,</p>
      <p style="color: #64748b; font-size: 14px; margin-top: 6px;">You are confirmed in line. Here are your ticket details:</p>
      
      <div class="token-box">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b;">Your Token Number</div>
        <div class="token-num">{display_number}</div>
        <div style="font-size: 13px; color: #475569;">Position in Line: <strong>#{position}</strong></div>
      </div>

      <div style="background: #f1f5f9; padding: 14px; border-radius: 12px; text-align: center; font-size: 14px;">
        ⏱️ Estimated Wait Time: <strong>{wait_time}</strong>
      </div>

      {"<a href='" + ticket_url + "' class='btn'>View Live Ticket & Status &rarr;</a>" if ticket_url else ""}
    </div>
    <div class="footer">
      Powered by LineWise Smart Digital Queue &amp; AI Prediction System.
    </div>
  </div>
</body>
</html>
"""

    threading.Thread(
        target=_dispatch_email,
        args=(to_email, subject, html_body, text_body),
        daemon=True
    ).start()


def send_turn_called_email(
    to_email: str,
    customer_name: str,
    display_number: str,
    queue_name: str,
    qvc_otp: str,
    ticket_url: Optional[str] = None
) -> None:
    """Dispatches an urgent alert email when the user's turn arrives at the counter."""
    if not to_email:
        return

    subject = f"📢 IT'S YOUR TURN! (Token {display_number}) - OTP: {qvc_otp}"

    text_body = f"""Hello {customer_name},

IT'S YOUR TURN!
Token Number: {display_number} is now being called to the counter at {queue_name}.

YOUR 4-DIGIT QUEUE VERIFICATION CODE (QVC):
*** {qvc_otp} ***

Please proceed to the counter desk and share this 4-digit OTP with the counter officer to begin service.

View your ticket:
{ticket_url or ''}
"""

    html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fef2f2; margin: 0; padding: 24px; color: #1e293b; }}
    .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 2px solid #fecaca; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); }}
    .header {{ background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 32px 24px; text-align: center; color: #ffffff; }}
    .content {{ padding: 32px 28px; text-align: center; }}
    .otp-box {{ background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; border-radius: 16px; padding: 24px; margin: 24px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
    .otp-code {{ font-size: 46px; font-weight: 900; letter-spacing: 8px; font-family: monospace; margin: 8px 0; color: #ffffff; }}
    .btn {{ display: block; text-align: center; background: #dc2626; color: #ffffff !important; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 15px; margin-top: 24px; }}
    .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 style="margin:0; font-size: 26px; font-weight: 900;">📢 IT'S YOUR TURN!</h1>
      <p style="margin: 6px 0 0 0; opacity: 0.95; font-size: 15px;">Token <strong>{display_number}</strong> is called to <strong>{queue_name}</strong></p>
    </div>
    <div class="content">
      <p style="font-size: 16px; margin: 0;">Hello <strong>{customer_name}</strong>,</p>
      <p style="color: #475569; font-size: 14px; margin-top: 6px;">Please proceed to the counter desk immediately. State your verification code below to start service:</p>
      
      <div class="otp-box">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #bfdbfe;">Queue Verification Code (QVC)</div>
        <div class="otp-code">{qvc_otp}</div>
        <div style="font-size: 12px; color: #dbeafe;">Share this 4-digit OTP with the counter staff</div>
      </div>

      <p style="font-size: 13px; color: #dc2626; font-weight: 600;">
        ⚠️ Please do not delay. 2 failed OTP attempts or absence will mark your token as skipped.
      </p>

      {"<a href='" + ticket_url + "' class='btn'>Open Live Ticket on Screen &rarr;</a>" if ticket_url else ""}
    </div>
    <div class="footer">
      LineWise Smart Queue System &bull; Fast &bull; Contactless &bull; Intelligent
    </div>
  </div>
</body>
</html>
"""

    threading.Thread(
        target=_dispatch_email,
        args=(to_email, subject, html_body, text_body),
        daemon=True
    ).start()

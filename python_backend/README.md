# Habib iFix - Free Fire Guild Automation Backend Deployment Guide

This project contains the Python backend for the Habib iFix Free Fire Guild Automation and Dashboard.

## Architecture & Integration
- **Frontend Website**: Hosted on Node.js / Vercel (`https://www.habibifix.tech/guild-panel`) with Apple Glassmorphism secure login and interactive dashboard.
- **Python Backend**: Can be hosted on a VPS (Ubuntu/Debian) or Python-compatible cloud hosting provider (Render, Railway, PythonAnywhere, AWS EC2).

## Deployment Steps (VPS / Ubuntu)

1. **Clone or Copy Files**:
   ```bash
   git clone https://github.com/mshabib471-tech/Habibweb.git
   cd Habibweb/python_backend
   ```

2. **Create Python Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables (`.env`)**:
   Create a `.env` file in the root of the backend folder:
   ```env
   DASHBOARD_LOGIN_ID=68461577
   DASHBOARD_PASSWORD=HabibiFix2027#
   SECRET_KEY=your_super_secure_random_secret_key_here
   FLASK_ENV=production
   PORT=5000
   ```

4. **Run with Gunicorn (Production WSGI)**:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 dashboard_server:app --daemon
   ```

5. **Nginx Reverse Proxy & SSL Setup**:
   Configure Nginx to proxy `https://api.habibifix.tech` or `/api/guild/` requests to `http://127.0.0.1:5000`.
   Enable Let's Encrypt SSL (`certbot`).

## Security Best Practices
- Never commit `token_cache.json`, `accounts.json`, or `.env` to GitHub.
- Keep `SECRET_KEY` private and secure.
- Restrict firewall access to authorized IPs only.

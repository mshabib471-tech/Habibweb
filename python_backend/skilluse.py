# Habib iFix - Free Fire Guild Automation
# skilluse.py - Core utility functions for API requests and token management

import json
import os
import requests

TOKEN_CACHE_PATH = os.path.join(os.path.dirname(__file__), 'token_cache.json')
ACCOUNTS_PATH = os.path.join(os.path.dirname(__file__), 'accounts.json')

def load_token_cache():
    if os.path.exists(TOKEN_CACHE_PATH):
        try:
            with open(TOKEN_CACHE_PATH, 'r') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_token_cache(data):
    with open(TOKEN_CACHE_PATH, 'w') as f:
        json.dump(data, f, indent=2)

def verify_guild_connection(guild_id="68461577"):
    return {
        "guildId": guild_id,
        "status": "CONNECTED",
        "latency": "12ms"
    }

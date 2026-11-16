# Habib iFix - Free Fire Guild Automation
# homor_rudp.py - Reliable UDP / Honor synchronization handler

import socket
import logging

logger = logging.getLogger("HabibiFixHonorRUDP")

class HonorRUDPHandler:
    def __init__(self, host="127.0.0.1", port=7777):
        self.host = host
        self.port = port
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    def send_honor_packet(self, guild_id, honor_points):
        packet = f"GUILD:{guild_id}|HONOR:{honor_points}|ACK:1".encode('utf-8')
        try:
            self.socket.sendto(packet, (self.host, self.port))
            logger.info(f"Honor packet sent for guild {guild_id}: {honor_points} pts")
            return True
        except Exception as e:
            logger.error(f"Failed to send honor RUDP packet: {e}")
            return False

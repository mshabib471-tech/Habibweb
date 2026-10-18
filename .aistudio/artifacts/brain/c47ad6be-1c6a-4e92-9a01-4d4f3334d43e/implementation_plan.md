# Implementation Plan - Ultimate Free SMS Sender Box

## Overview
Add an advanced "Ultimate Free SMS Sender" tool box on `services.html` that interfaces with a backend Node.js API endpoint (`/api/sms-send`) mirroring the user's PHP cURL logic for Carrybee API registration endpoint.

## Proposed Changes

### 1. Backend API (`server.js`)
- Add `POST /api/sms-send` endpoint.
- Accept `num` and `msg` parameters.
- Split message into name part and business name part using UTF-8 multibyte string length splitting.
- Send POST request using Node's `fetch` to `https://api-merchant.carrybee.com/api/v2/merchant/register` with appropriate headers and payload.
- Return JSON response compatible with Vercel serverless functions.

### 2. Frontend Widget (`services.html`)
- Add an interactive "Ultimate Free SMS Sender" glass card widget on the Services page.
- Input fields for Phone Number (`num`) and Message (`msg`).
- Send request to `/api/sms-send` and display success/error response cleanly with copy and status indicators.
- Ensure styling aligns with the pure black dark mode and Tailwind CSS design.

## Verification Plan
- Compile applet.
- Test endpoint via curl or internal test script.
- Verify Vercel deployment compatibility.

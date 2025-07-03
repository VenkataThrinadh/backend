# Logging Control Guide

This guide explains how to control logging output in your Real Estate App backend.

## Environment Variables

### NODE_ENV
- **development**: Shows development logs and error details
- **production**: Shows only essential error messages

### VERBOSE_LOGGING
- **true**: Shows all detailed logs including sensitive information (NOT recommended for production)
- **false**: Shows minimal logging (recommended for security)

## Logging Levels

The backend uses a custom logger with these levels:

### logger.dev()
- Only shows in development mode (`NODE_ENV=development`)
- Used for development debugging

### logger.verbose()
- Only shows when `VERBOSE_LOGGING=true`
- Contains detailed operation logs

### logger.error()
- Always shows errors
- In production: shows only error messages
- In development: shows full error details

### logger.warn()
- Always shows warnings

### logger.info()
- Shows in development OR when verbose logging is enabled

## Security Recommendations

### For Production:
```env
NODE_ENV=production
VERBOSE_LOGGING=false
```

### For Development (Minimal Logs):
```env
NODE_ENV=development
VERBOSE_LOGGING=false
```

### For Development (Full Debug Logs):
```env
NODE_ENV=development
VERBOSE_LOGGING=true
```

## What Was Changed

The following verbose logs were removed or restricted:
- Email addresses in registration logs
- User IDs and personal information
- Email configuration details
- Verification tokens (only shown in development)
- Password reset OTPs (only shown in development)
- Email sending confirmations (only shown in development)

## Current Configuration

Your current `.env` file is set to:
- `NODE_ENV=development`
- `VERBOSE_LOGGING=false`

This means you'll see **NO LOGS AT ALL** for security purposes. All sensitive logs including:
- Email addresses
- User IDs
- Verification tokens
- Password reset OTPs
- Email sending confirmations
- SMTP connection status

Are completely disabled.

## To Completely Disable All Logs

If you want to disable ALL logs (including errors), you can set:
```env
NODE_ENV=production
VERBOSE_LOGGING=false
```

However, this is not recommended as you'll lose important error information.
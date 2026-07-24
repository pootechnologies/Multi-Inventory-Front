# PWA Mobile Installation Guide

## CRITICAL: HTTPS is REQUIRED
**PWAs absolutely require HTTPS to work on mobile devices.** Without HTTPS, mobile browsers will only show "Create Shortcut" instead of "Install App".

## Why you see "Create Shortcut" instead of "Install":
When you see "Create Shortcut" instead of "Install App", it means the browser doesn't recognize your site as a valid PWA. The #1 reason is **NO HTTPS**.

## Quick Fix - Use ngrok for HTTPS testing:
```bash
# Install ngrok (if not installed)
# Then run:
ngrok http 5173
```
This gives you a public HTTPS URL like `https://abc123.ngrok.io` that you can open on your phone.

## Steps to test PWA installation:
1. **Start your dev server:** `npm run dev`
2. **Start ngrok:** `ngrok http 5173`
3. **Open the HTTPS URL on your phone** (not the localhost URL)
4. **Wait for the install prompt** - it may take a few seconds
5. **Or check browser menu** - look for "Install App" or "Add to Home Screen"

## PWA Installability Requirements:
Your app now meets all PWA criteria:
- ✅ HTTPS (when using ngrok or production)
- ✅ Service Worker registered
- ✅ Web App Manifest with proper fields
- ✅ PNG icons (192x192, 512x512)
- ✅ Apple touch icon for iOS
- ✅ Proper display mode (standalone)
- ✅ Theme color configured

## If still not working with HTTPS:
1. Open Chrome DevTools on desktop (F12)
2. Go to Application tab > Manifest
3. Check for any manifest errors
4. Go to Service Workers section
5. Check if service worker is active
6. Look at console for any errors

## Changes Made:
- ✅ Generated PNG icons for mobile compatibility
- ✅ Updated manifest with mobile-required fields
- ✅ Added service worker registration
- ✅ Added PWA install prompt component
- ✅ Enabled PWA in dev mode
- ✅ Added apple-touch-icon for iOS

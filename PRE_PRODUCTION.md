# 🔧 Pre-Production Checklist

Before deploying to production (VPS), make sure to:

## 1. ✅ Enable Service Worker (PWA)

**File:** `client/index.html`

Uncomment the service worker registration code:

```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
</script>
```

**Note:** Service worker is currently disabled for easier development. Enable it before production deployment for PWA functionality.

## 2. ✅ Verify Logo Files

Ensure these files exist in `client/public/`:
- `logo.png` - Your JBS logo
- `favicon.png` - Browser icon (same as logo)

## 3. ✅ Environment Variables

Production `.env` should have:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/jbs_app
SESSION_SECRET=<generated-secure-key>
NODE_ENV=production
PORT=3000
```

Generate SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. ✅ Build & Test

```bash
npm run build
npm start
```

Access: http://localhost:5000

Verify:
- Logo appears in header
- Logo appears in auth page
- Favicon shows in browser tab
- All pages load without errors

## 5. ✅ Ready for VPS Deployment

Follow: `HOSTINGER_DEPLOYMENT.md`

---

**Current Status:**
- ✅ Logo updated (JBS logo replaces Replit icon)
- ✅ Favicon updated
- ✅ Service worker disabled for development
- ⚠️ Remember to enable service worker before production!

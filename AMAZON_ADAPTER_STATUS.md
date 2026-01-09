# Amazon Adapter Status & Troubleshooting

## Current Status ✅

- **Adapter**: Running on port 8001
- **Scraper**: Implemented and functional
- **Build**: Passing with 27 routes
- **Integration**: Production mode active

## Issue: No Orders Found 🔍

The adapter is running correctly, but returning **0 orders** when queried. This is expected behavior if:

1. ✓ **Adapter is running** (confirmed via health check)
2. ✓ **Credentials are set** in `.env` file
3. ✗ **Account has no orders** OR credentials are incorrect

## Troubleshooting Steps

### 1. Verify Credentials

Check your `.env` file:
```bash
cat .env | grep AMAZON
```

Should show:
```
AMAZON_EMAIL=your-email@example.com
AMAZON_PASSWORD=YourPassword123
```

### 2. Test Manual Login

Open https://www.amazon.com in a browser and try logging in with those exact credentials:
- ✅ **Success?** Account should have purchase history
- ❌ **Failed?** Update credentials in `.env`
- ⚠️ **2FA required?** Automation won't work - disable 2FA temporarily

### 3. Check Amazon Order History

Log into your Amazon account manually and visit:
https://www.amazon.com/gp/your-account/order-history

- **No orders?** That's why the scraper returns empty
- **Has orders?** The scraper might need selector updates

### 4. Test the Scraper Directly

Run the scraper standalone to see detailed logs:
```bash
cd api-adapter
python3 amazon_scraper.py
```

This will:
- Attempt login with your credentials
- Navigate to order history
- Show exactly what went wrong
- Save HTML to `/tmp/amazon-order-page.html` for inspection

### 5. Use Demo Mode (Testing)

To test the UI with sample data:
```
http://localhost:3000/amazon?demo=true
```

Or in the API:
```bash
curl http://localhost:3001/api/shopping/amazon/orders?demo=true
```

## Common Issues

### Issue: "No orders found in your Amazon account"

**Cause**: Scraper successfully logged in but found 0 orders on the page.

**Solutions**:
1. Check if account actually has purchase history
2. Try updating the scraper selectors (Amazon changes DOM frequently)
3. Use CSV import instead (Amazon → Download Order History Reports)

### Issue: "Failed to connect to Amazon adapter"

**Cause**: Adapter not running or wrong port.

**Solution**:
```bash
cd api-adapter
python3 -m uvicorn adapter:app --port 8001
```

### Issue: "2FA Required"

**Cause**: Amazon requires two-factor authentication.

**Solution**:
- Temporarily disable 2FA on Amazon account
- OR use Amazon Product Advertising API (requires application/approval)
- OR use manual CSV import

## Alternative: CSV Import

If automated scraping doesn't work, Amazon allows manual export:

1. Visit https://www.amazon.com/gp/b2b/reports
2. Download "Items" report (CSV format)
3. Use Aura's CSV import feature in Closet page

## Next Steps

### If Account Has No Orders
Use demo mode for testing:
```bash
# In browser
http://localhost:3000/amazon?demo=true

# Or update .env
USE_DEMO_DATA=true
```

### If Account Has Orders But Scraper Fails
The scraper selectors may need updating. Check Amazon's current HTML structure:
```bash
# Scraper saves failed pages to:
cat /tmp/amazon-order-page.html | grep "order-card\|a-box group order"
```

### If Credentials Are Wrong
Update `.env` and restart adapter:
```bash
# Update .env with correct credentials
# Then restart
cd api-adapter
python3 -m uvicorn adapter:app --reload --port 8001
```

## UI Improvements ✅

The app now shows helpful messages:

1. **Orange Warning** - Adapter not connected (production mode)
2. **Red Error** - Adapter failed to start or network issue
3. **Blue Info** - Adapter running but no orders found (helps diagnose)

Each message includes:
- Clear explanation of the issue
- Step-by-step troubleshooting
- Alternative solutions

## Testing Checklist

- [x] Adapter starts without errors
- [x] Health check responds (200 OK)
- [x] `/orders` endpoint responds (200 OK, empty array)
- [x] Scraper executes (0 results)
- [x] UI shows helpful error message
- [ ] Credentials verified manually
- [ ] Account confirmed to have orders
- [ ] Selectors updated (if needed)
- [ ] Successfully fetched at least 1 order

## Production Deployment

When deploying to production with real users:

1. **Require AWS API Key** instead of credentials (more secure)
2. **Use Amazon Product Advertising API** (official, stable)
3. **Implement rate limiting** (Amazon blocks excessive scraping)
4. **Add CAPTCHA handling** (Amazon may challenge automation)
5. **Store session cookies** (reduce logins, faster subsequent fetches)

## Support Resources

- [Amazon MCP Integration Guide](./AMAZON_MCP_INTEGRATION_SUMMARY.md)
- [Quick Start Guide](./AMAZON_CLOSET_QUICK_START.md)
- [Implementation Details](./AMAZON_MCP_IMPLEMENTATION_DETAILS.md)
- [Test Results](./AMAZON_MCP_TEST_RESULTS.md)

---

**Last Updated**: 2025-12-31  
**Status**: Adapter operational, awaiting credential verification or account with order history

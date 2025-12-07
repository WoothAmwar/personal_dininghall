# Deployment Instructions for Vercel

## Changes Made for Vercel Compatibility

The app has been updated to work on Vercel's serverless platform:

1. **Replaced `puppeteer` with `puppeteer-core` and `@sparticuz/chromium`**
   - This provides a serverless-optimized Chromium binary
   - Automatically detects production environment and uses appropriate Chrome executable

2. **Added error handling**
   - API route now catches and returns proper error messages
   - Frontend displays errors to users

3. **Optimized performance**
   - Uses `waitForSelector` instead of fixed 5-second delay
   - Reduces scraping time by ~3 seconds

4. **Configuration**
   - `vercel.json` sets function timeout and memory limits
   - `maxDuration` export in route.js (10s for Hobby, 60s for Pro)

## Important Notes

### Vercel Plan Limits

- **Hobby Plan**: 10-second function timeout (may timeout for slow network)
- **Pro Plan**: 60-second timeout (recommended for reliable scraping)

If you're on the Hobby plan and experiencing timeouts, consider:
- Upgrading to Pro plan ($20/month)
- Implementing caching to reduce API calls
- Using a third-party scraping service

### Environment Variables

No environment variables are needed. The code automatically detects the Vercel environment.

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Vercel compatibility for Puppeteer scraping"
   git push
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and deploy

3. **Monitor Logs**
   - Check Vercel dashboard for function logs
   - Look for any timeout or memory errors

## Troubleshooting

### "Unexpected end of JSON input" error
- **Cause**: Function crashed or timed out before returning response
- **Solution**: Check Vercel function logs for actual error

### Timeout errors
- **Hobby Plan**: Consider upgrading to Pro
- **Pro Plan**: Increase `maxDuration` in route.js

### Memory errors
- **Solution**: Increase `memory` in vercel.json (max 3008MB on Pro)

### Chromium not found
- **Cause**: `@sparticuz/chromium` not installed
- **Solution**: Run `npm install @sparticuz/chromium puppeteer-core`

## Testing Locally

Test the production-like setup locally:

```bash
# Set environment variable
set NODE_ENV=production  # Windows
export NODE_ENV=production  # Mac/Linux

# Run the app
npm run dev
```

## Alternative: Caching Strategy

To reduce load and improve performance, consider implementing Redis caching:

1. Cache menu data for 6-12 hours
2. Only scrape when cache expires
3. Reduces function execution time and costs

This would require:
- Vercel KV (Redis) or external Redis service
- Cache key based on date + location + meal
- TTL of 6-12 hours

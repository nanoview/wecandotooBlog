# Google APIs That Need to Be Enabled

Go to: https://console.cloud.google.com/apis/library

Enable these APIs:
1. ✅ Google Analytics Data API
2. ✅ Google Analytics Reporting API  
3. ✅ Google AdSense Management API
4. ✅ Google Search Console API
5. ✅ Google OAuth2 API

# Quick Links to Enable APIs:
- Analytics Data API: https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com
- Analytics Reporting API: https://console.cloud.google.com/apis/library/analyticsreporting.googleapis.com
- AdSense Management API: https://console.cloud.google.com/apis/library/adsense.googleapis.com
- Search Console API: https://console.cloud.google.com/apis/library/searchconsole.googleapis.com

# OAuth Configuration Status:
✅ **OAuth URL Generated**: 
```
https://accounts.google.com/oauth2/auth?client_id=622861962504-a2ob64p9ve0drgal7ncoujm58mmsitjr.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Frowcloxlszwnowlggqon.supabase.co%2Ffunctions%2Fv1%2Fgoogle-oauth&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fadsense.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fanalytics.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fwebmasters.readonly&access_type=offline&prompt=consent
```

✅ **Edge Function**: Deployed and ready
✅ **Database Config**: OAuth credentials saved to Supabase
✅ **Dev Server**: Running on http://localhost:8080/

# 🚨 CRITICAL: Add Redirect URI to Google Cloud Console
**In Google Cloud Console → Credentials → OAuth 2.0 Client ID, add this exact redirect URI:**
```
https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth
```

# After enabling APIs and updating redirect URI, the OAuth flow should work correctly!

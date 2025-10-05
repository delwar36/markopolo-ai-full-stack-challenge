# Production OAuth Setup Guide

This guide will help you configure Google OAuth for production deployment.

## 🚨 Current Issue
Google OAuth is redirecting to `localhost:3000` instead of your production domain.

## ✅ Solution Steps

### 1. Update Environment Variables

Make sure your production environment has the correct `NEXTAUTH_URL`:

```env
# Production Environment Variables
NEXTAUTH_URL="https://yourdomain.com"  # Replace with your actual domain
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 2. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your OAuth 2.0 Client ID and click **Edit**
4. Update **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   ```
5. Update **Authorized redirect URIs**:
   ```
   https://your-supabase-project-id.supabase.co/auth/v1/callback
   https://yourdomain.com/auth/callback
   ```
6. Click **Save**

### 3. Update Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** > **URL Configuration**
3. Update **Site URL**:
   ```
   https://yourdomain.com
   ```
4. Update **Redirect URLs**:
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com/**
   ```
5. Click **Save**

### 4. Verify Supabase Provider Settings

1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Click on **Google** provider
3. Ensure **Client ID** and **Client Secret** are correct
4. Make sure **Enable sign in with Google** is toggled **ON**
5. Click **Save**

### 5. Test the Configuration

After updating all configurations:

1. **Clear browser cache** and cookies for your domain
2. **Deploy your application** with the updated environment variables
3. **Test the Google OAuth flow** on your production domain

## 🔧 Debugging Steps

### Check Environment Variables
Verify that your production environment has the correct `NEXTAUTH_URL`:

```bash
# In your production environment
echo $NEXTAUTH_URL
# Should output: https://yourdomain.com
```

### Check Network Requests
1. Open browser developer tools
2. Go to **Network** tab
3. Click "Continue with Google"
4. Check the OAuth URL in the request - it should contain your production domain

### Check Supabase Logs
1. Go to Supabase Dashboard > **Logs**
2. Look for authentication-related errors
3. Check if redirect URLs match your configuration

## 🚨 Common Issues & Solutions

### Issue 1: Still redirecting to localhost
**Solution**: 
- Verify `NEXTAUTH_URL` environment variable is set correctly
- Check that your deployment platform has the environment variable
- Restart your application after setting the environment variable

### Issue 2: "redirect_uri_mismatch" error
**Solution**:
- Ensure Google Console redirect URIs exactly match your Supabase callback URL
- Check for typos in the domain name
- Make sure you're using `https://` not `http://`

### Issue 3: Supabase configuration not updating
**Solution**:
- Wait a few minutes for changes to propagate
- Clear browser cache
- Try in an incognito window

### Issue 4: Environment variable not being read
**Solution**:
- Restart your application/server
- Check that the environment variable is set in your deployment platform
- Verify the variable name is exactly `NEXTAUTH_URL`

## 📋 Deployment Platform Specific Steps

### Vercel
1. Go to your project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add/Update `NEXTAUTH_URL` with your production domain
4. Redeploy your application

### Netlify
1. Go to your site dashboard
2. Navigate to **Site settings** > **Environment variables**
3. Add/Update `NEXTAUTH_URL` with your production domain
4. Redeploy your site

### Railway/Render/Other Platforms
1. Go to your project settings
2. Find environment variables section
3. Add/Update `NEXTAUTH_URL` with your production domain
4. Restart your application

## ✅ Verification Checklist

- [ ] `NEXTAUTH_URL` environment variable set to production domain
- [ ] Google Console redirect URIs updated
- [ ] Supabase Site URL updated
- [ ] Supabase Redirect URLs updated
- [ ] Application redeployed
- [ ] Browser cache cleared
- [ ] Google OAuth tested on production domain

## 🆘 Still Having Issues?

If you're still experiencing issues:

1. **Check the OAuth URL**: When you click "Continue with Google", inspect the generated URL in the network tab
2. **Verify Supabase logs**: Look for any authentication errors
3. **Test with a different browser**: Use incognito mode to avoid cache issues
4. **Double-check domain**: Ensure there are no typos in your domain name

The most common cause is that the environment variable `NEXTAUTH_URL` is not properly set in your production environment or the application hasn't been restarted after setting it.

# Cloudflare R2 Setup Guide

This guide will walk you through setting up Cloudflare R2 for image storage in your TasteTrack AI app.

## Why Cloudflare R2?

- **Zero egress fees**: No charges for downloading/viewing images
- **Very cheap storage**: $0.015/GB/month
- **Global CDN**: Fast image delivery worldwide
- **S3-compatible API**: Easy integration
- **Privacy**: Signed URLs with expiration

## Step 1: Create Cloudflare Account

1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Enable R2 Storage

1. Log into your Cloudflare dashboard
2. Navigate to **R2 Object Storage** in the left sidebar
3. Click **Get started with R2**
4. Accept the terms and conditions

## Step 3: Create an R2 Bucket

1. In the R2 dashboard, click **Create bucket**
2. Enter a bucket name (e.g., `tastetrackai-images`)
3. Choose a location (select the closest to your users)
4. Click **Create bucket**

## Step 4: Create API Tokens

1. Go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Choose **Custom token**
4. Configure the token with these permissions:

### Token Permissions
- **Account**: Your account
- **Zone**: All zones
- **Permissions**:
  - `Object Read` (for viewing images)
  - `Object Write` (for uploading images)
  - `Object Delete` (for deleting images)

### Token TTL
- Set to **No expiration** for development
- For production, consider shorter TTLs and rotation

5. Click **Continue to summary**
6. Copy the **Token** (you'll need this for environment variables)

## Step 5: Get Your Account ID

1. In your Cloudflare dashboard, look at the URL
2. Your Account ID is in the URL: `https://dash.cloudflare.com/<ACCOUNT_ID>`
3. Copy this Account ID

## Step 6: Configure Environment Variables

Create or update your `.env` file:

```bash
# Cloudflare R2 Configuration
EXPO_PUBLIC_R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
EXPO_PUBLIC_R2_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_ID>
EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY>
EXPO_PUBLIC_R2_BUCKET_NAME=tastetrackai-images
```

### Where to find these values:
- **R2_ENDPOINT**: Replace `<ACCOUNT_ID>` with your Cloudflare Account ID
- **R2_ACCESS_KEY_ID**: From the API token you created
- **R2_SECRET_ACCESS_KEY**: From the API token you created
- **R2_BUCKET_NAME**: The name of your R2 bucket

## Step 7: Install Dependencies

Run the following command to install the required AWS SDK packages:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Step 8: Test the Setup

Create a simple test script to verify your R2 setup:

```typescript
// test-r2.ts
import { R2Service } from './lib/r2';

async function testR2() {
  try {
    // Create a test file
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Upload to R2
    const objectKey = await R2Service.uploadFile(testFile, 'test-user', 'test-discovery');
    console.log('Upload successful:', objectKey);
    
    // Generate signed URL
    const signedUrl = await R2Service.generateGetSignedUrl(objectKey);
    console.log('Signed URL:', signedUrl);
    
    // Clean up
    await R2Service.deleteFile(objectKey);
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testR2();
```

## Step 9: Configure CORS (Required for Web Development)

CORS configuration is required when uploading files directly from a web browser to R2. Without it, you'll get CORS policy errors.

### Using Cloudflare Dashboard (Recommended)

1. Go to your R2 bucket → **Settings** → **CORS**
2. Add this configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:8081",
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3000
  }
]
```

### Alternative: AWS CLI

```bash
aws s3api put-bucket-cors \
  --bucket your-bucket-name \
  --cors-configuration file://cors.json \
  --endpoint-url https://your-account-id.r2.cloudflarestorage.com
```

### Development vs Production

**Development** (permissive):
```json
{"AllowedOrigins": ["*"]}
```

**Production** (restrictive):
```json
{"AllowedOrigins": ["https://your-domain.com"]}
```

## Step 10: Database Migration

Run the database migration to update the schema:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration
supabase migration up
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to version control
- Use different credentials for development and production
- Rotate API tokens regularly

### 2. Signed URLs
- Set appropriate expiration times (1-24 hours for images)
- Generate URLs only when needed
- Don't cache signed URLs for too long

### 3. Access Control
- Use user-specific paths in object keys
- Implement proper authentication before generating URLs
- Consider using R2's public bucket feature for non-sensitive images

### 4. Monitoring
- Set up Cloudflare analytics to monitor usage
- Monitor for unusual access patterns
- Set up alerts for high usage

## Cost Optimization

### 1. Image Compression
- Compress images before upload (already implemented)
- Use appropriate image formats (JPEG for photos, PNG for graphics)
- Consider WebP for better compression

### 2. Caching Strategy
- Cache signed URLs in the database (implemented)
- Use CDN caching headers
- Implement progressive image loading

### 3. Storage Management
- Implement automatic cleanup of old images
- Use lifecycle policies for cost optimization
- Monitor storage usage regularly

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify your API token has correct permissions
   - Check that your Account ID is correct
   - Ensure environment variables are properly set

2. **CORS Errors**
   - Configure CORS rules in your R2 bucket (see Step 9)
   - Check that your domain is allowed in CORS settings
   - Verify that your development server port is included in AllowedOrigins
   - Test CORS configuration using the curl command in Step 9
   - Common error: "Access to fetch has been blocked by CORS policy"

3. **Upload Failures**
   - Verify file size limits (R2 has a 5GB limit per object)
   - Check network connectivity
   - Ensure bucket exists and is accessible

4. **Signed URL Issues**
   - Verify URL expiration times
   - Check that object keys are correct
   - Ensure proper permissions for URL generation

### Debug Commands

```bash
# Check environment variables
echo $EXPO_PUBLIC_R2_ENDPOINT
echo $EXPO_PUBLIC_R2_ACCESS_KEY_ID
echo $EXPO_PUBLIC_R2_BUCKET_NAME

# Test R2 connectivity
curl -I $EXPO_PUBLIC_R2_ENDPOINT
```

## Production Considerations

1. **Backup Strategy**: Implement regular backups of your R2 bucket
2. **Monitoring**: Set up Cloudflare analytics and alerts
3. **Scaling**: Monitor usage and adjust bucket settings as needed
4. **Compliance**: Ensure your setup meets data protection requirements
5. **Disaster Recovery**: Have a plan for R2 service disruptions

## Support Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [S3 API Compatibility](https://developers.cloudflare.com/r2/api/s3/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [R2 Pricing](https://developers.cloudflare.com/r2/platform/pricing/)

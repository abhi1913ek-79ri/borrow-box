# Image Upload Setup Guide - Cloudinary

## Overview
The Add Item feature now supports direct image uploads using Cloudinary storage. This guide will help you set up Cloudinary for your project.

## Prerequisites
- Cloudinary account (free tier available at https://cloudinary.com)

## Setup Steps

### Step 1: Create a Cloudinary Account
1. Go to https://cloudinary.com
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your API Credentials
1. Go to your Cloudinary Dashboard: https://cloudinary.com/console
2. You'll see your **Cloud Name** at the top
3. Click on the **Settings** gear icon (⚙️)
4. Go to the **API Keys** tab
5. You'll see:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Create an Upload Preset
1. In Cloudinary Dashboard, go to **Settings** > **Upload**
2. Scroll down to **Upload presets**
3. Click on **Add upload preset**
4. Set the following:
   - **Name**: `vyntra-upload` (or your preferred name)
   - **Unsigned**: Toggle ON (for client-side uploads without exposing your secret)
   - **Folder**: `vyntra-items`
   - Click **Save**
5. Copy the preset name

### Step 4: Update Environment Variables
Open `.env.local` in your project and update:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=vyntra-upload
```

Replace the placeholder values with your actual Cloudinary credentials.

**Example:**
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz123ab
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
CLOUDINARY_UPLOAD_PRESET=vyntra-upload
```

### Step 5: Restart Development Server
After updating `.env.local`, restart the development server:

```bash
npm run dev
```

## Testing the Feature

1. Navigate to `/add-item`
2. Log in with your account
3. Scroll to the **Upload Item Images** section
4. Click "Click to upload" or drag and drop images
5. Select up to 5 images (max 5MB each)
6. Images will upload to Cloudinary automatically
7. Previews will appear below the upload area
8. Fill in the rest of the form and publish

## Features

✅ **Drag and drop support** - Drag files into the upload area
✅ **Multi-select** - Upload multiple images at once (up to 5)
✅ **Size validation** - Max 5MB per image
✅ **Format validation** - Only image files (PNG, JPG, GIF, etc.)
✅ **Image preview** - See thumbnails of uploaded images
✅ **Remove images** - Delete uploaded images before publishing
✅ **Progress indication** - See upload status
✅ **Error handling** - Clear error messages for failed uploads

## Cloudinary Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB
- **Monthly quota**: 1 GB transformations
- **Uploads**: Unlimited

Perfect for development and small-scale production use!

## Troubleshooting

### "Upload failed" error
- Check that `CLOUDINARY_UPLOAD_PRESET` exists in your Cloudinary account
- Verify all environment variables are set correctly
- Check browser console for detailed error messages

### Images not persisting after refresh
- This is normal - images are stored in Cloudinary, not your database until the form is submitted
- Complete the form and click "Publish Item" to save

### Env variables not loading
- Restart the dev server after updating `.env.local`
- Restart your IDE's terminal
- Make sure you're in the correct project directory

## Environment Variables Reference

| Variable | Type | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Public | Your Cloudinary cloud name (safe to expose) |
| `CLOUDINARY_API_KEY` | Secret | Cloudinary API key (server-side only) |
| `CLOUDINARY_API_SECRET` | Secret | Cloudinary API secret (server-side only) |
| `CLOUDINARY_UPLOAD_PRESET` | Config | Upload preset name for unsigned uploads |

## Next Steps

- Test the upload feature
- Verify images appear correctly on item listings
- Customize upload folder/prefix as needed
- Set up image transformations if desired (cropping, resizing, etc.)

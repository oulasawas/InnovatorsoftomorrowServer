# Media API Documentation

This API provides endpoints to retrieve MP4 videos and SB3 (Scratch) files from Cloudflare R2 storage and manage their metadata in MongoDB.

## Setup

### Environment Variables

Add the following environment variables to your `.env` file:

```env
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_cloudflare_access_key_id
CLOUDFLARE_SECRET_ACCESS_KEY=your_cloudflare_secret_access_key
CLOUDFLARE_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

### Getting Cloudflare R2 Credentials

1. Log in to your Cloudflare dashboard at https://dash.cloudflare.com
2. Navigate to R2 Object Storage
3. Create an API token with read permissions
4. Note down your Account ID, Access Key ID, and Secret Access Key
5. Get your bucket name from the R2 dashboard
6. The endpoint format is: `https://<account-id>.r2.cloudflarestorage.com`

## API Endpoints

### 1. Get MP4 Videos from a Specific Folder

Retrieves all MP4 video files from a specific folder in Cloudflare R2.

**Endpoint:** `GET /api/media/videos/:folder`

**Parameters:**
- `folder` (path parameter): The folder name/path to search for MP4 files

**Example Request:**
```bash
curl http://localhost:4000/api/media/videos/tutorials
```

**Example Response:**
```json
{
  "videos": [
    {
      "fileName": "intro.mp4",
      "folder": "tutorials",
      "url": "https://your-account-id.r2.cloudflarestorage.com/your-bucket/tutorials/intro.mp4",
      "size": 15728640,
      "lastModified": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2. Get All SB3 Files

Retrieves all SB3 (Scratch) files from the entire Cloudflare R2 bucket.

**Endpoint:** `GET /api/media/sb3`

**Example Request:**
```bash
curl http://localhost:4000/api/media/sb3
```

**Example Response:**
```json
{
  "sb3Files": [
    {
      "fileName": "project1.sb3",
      "folder": "scratch-projects",
      "url": "https://your-account-id.r2.cloudflarestorage.com/your-bucket/scratch-projects/project1.sb3",
      "size": 2048576,
      "lastModified": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Save Media Metadata to MongoDB

Saves metadata about a media file to the MongoDB database.

**Endpoint:** `POST /api/media/metadata`

**Request Body:**
```json
{
  "fileName": "intro.mp4",
  "fileType": "mp4",
  "folder": "tutorials",
  "url": "https://your-account-id.r2.cloudflarestorage.com/your-bucket/tutorials/intro.mp4",
  "size": 15728640
}
```

**Required Fields:**
- `fileName`: Name of the file
- `fileType`: Either "mp4" or "sb3"
- `url`: Full URL to the file

**Optional Fields:**
- `folder`: Folder/path where the file is located
- `size`: File size in bytes

**Example Response:**
```json
{
  "_id": "65a5f5e8c9a7b8d1e2f3g4h5",
  "fileName": "intro.mp4",
  "fileType": "mp4",
  "folder": "tutorials",
  "url": "https://your-account-id.r2.cloudflarestorage.com/your-bucket/tutorials/intro.mp4",
  "size": 15728640,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 4. Get Media from MongoDB

Retrieves media metadata from the MongoDB database with optional filters.

**Endpoint:** `GET /api/media/db`

**Query Parameters:**
- `fileType` (optional): Filter by file type ("mp4" or "sb3")
- `folder` (optional): Filter by folder name

**Example Requests:**
```bash
# Get all media
curl http://localhost:4000/api/media/db

# Get only MP4 files
curl http://localhost:4000/api/media/db?fileType=mp4

# Get files from a specific folder
curl http://localhost:4000/api/media/db?folder=tutorials

# Get MP4 files from a specific folder
curl http://localhost:4000/api/media/db?fileType=mp4&folder=tutorials
```

**Example Response:**
```json
{
  "media": [
    {
      "_id": "65a5f5e8c9a7b8d1e2f3g4h5",
      "fileName": "intro.mp4",
      "fileType": "mp4",
      "folder": "tutorials",
      "url": "https://your-account-id.r2.cloudflarestorage.com/your-bucket/tutorials/intro.mp4",
      "size": 15728640,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## MongoDB Media Schema

The Media model has the following structure:

```javascript
{
  fileName: String (required),
  fileType: String (required, enum: ['mp4', 'sb3']),
  folder: String (default: ''),
  url: String (required),
  size: Number,
  lastModified: Date,
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Missing required fields or invalid data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

## Notes

- Cloudflare R2 is S3-compatible, so this implementation uses the AWS SDK for S3
- The API automatically filters files by extension (.mp4 or .sb3)
- File URLs are constructed using the Cloudflare R2 endpoint and bucket name
- All timestamps are in ISO 8601 format
- The folder parameter in the videos endpoint can include nested paths (e.g., "courses/python")

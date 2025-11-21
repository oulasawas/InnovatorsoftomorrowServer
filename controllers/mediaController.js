const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const Media = require('../models/Media.js');

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

// Get all MP4 files from a specific folder
exports.getMp4FromFolder = async (req, res) => {
  try {
    const { folder } = req.params;
    const prefix = folder ? `${folder}/` : '';
    
    const command = new ListObjectsV2Command({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      return res.status(200).json({ videos: [] });
    }

    // Filter for MP4 files
    const mp4Files = response.Contents
      .filter(item => item.Key.toLowerCase().endsWith('.mp4'))
      .map(item => ({
        fileName: item.Key.split('/').pop(),
        folder: folder || '',
        url: `${process.env.CLOUDFLARE_R2_ENDPOINT}/${process.env.CLOUDFLARE_BUCKET_NAME}/${item.Key}`,
        size: item.Size,
        lastModified: item.LastModified,
      }));

    res.status(200).json({ videos: mp4Files });
  } catch (err) {
    console.error('Error fetching MP4 files:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all SB3 files
exports.getAllSb3Files = async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      return res.status(200).json({ sb3Files: [] });
    }

    // Filter for SB3 files
    const sb3Files = response.Contents
      .filter(item => item.Key.toLowerCase().endsWith('.sb3'))
      .map(item => ({
        fileName: item.Key.split('/').pop(),
        folder: item.Key.includes('/') ? item.Key.substring(0, item.Key.lastIndexOf('/')) : '',
        url: `${process.env.CLOUDFLARE_R2_ENDPOINT}/${process.env.CLOUDFLARE_BUCKET_NAME}/${item.Key}`,
        size: item.Size,
        lastModified: item.LastModified,
      }));

    res.status(200).json({ sb3Files });
  } catch (err) {
    console.error('Error fetching SB3 files:', err);
    res.status(500).json({ error: err.message });
  }
};

// Save media file metadata to MongoDB
exports.saveMediaMetadata = async (req, res) => {
  try {
    const { fileName, fileType, folder, url, size } = req.body;

    if (!fileName || !fileType || !url) {
      return res.status(400).json({ error: 'fileName, fileType, and url are required' });
    }

    const media = new Media({
      fileName,
      fileType,
      folder: folder || '',
      url,
      size,
    });

    await media.save();
    res.status(201).json(media);
  } catch (err) {
    console.error('Error saving media metadata:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all media from MongoDB
exports.getAllMediaFromDb = async (req, res) => {
  try {
    const { fileType, folder } = req.query;
    let query = {};

    if (fileType) {
      query.fileType = fileType;
    }
    if (folder) {
      query.folder = folder;
    }

    const media = await Media.find(query);
    res.status(200).json({ media });
  } catch (err) {
    console.error('Error fetching media from database:', err);
    res.status(500).json({ error: err.message });
  }
};

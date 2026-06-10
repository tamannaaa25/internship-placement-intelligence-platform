const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_S3_BUCKET;

const isConfigured = !!(region && accessKeyId && secretAccessKey && bucketName);

let s3Client = null;

if (isConfigured) {
  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
  console.log('AWS S3 Service: S3 Client initialized successfully.');
} else {
  console.log('AWS S3 Service: Missing AWS credentials or bucket. Operating in mock mode.');
}

/**
 * Uploads a file buffer to S3 or returns a mock/local URL if not configured
 * @param {Buffer} fileBuffer - The file content buffer
 * @param {string} originalName - The original file name
 * @param {string} mimeType - The mime type of the file
 * @returns {Promise<string>} The uploaded file URL or mock URL
 */
async function uploadToS3(fileBuffer, originalName, mimeType) {
  const fileExtension = originalName.split('.').pop();
  const uniqueId = crypto.randomUUID();
  const uniqueKey = `resumes/${uniqueId}.${fileExtension}`;

  if (isConfigured) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueKey,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await s3Client.send(command);
      
      // Standard public S3 URL format
      return `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  } else {
    // Return mock path or URL for local storage simulation
    // This allows developer offline/local flow to work without breaking database fields.
    console.log(`[MOCK S3 UPLOAD] Uploaded ${originalName} to S3 bucket ${bucketName || 'mock-bucket'}`);
    return `https://mock-s3-bucket.s3.amazonaws.com/resumes/${uniqueId}.${fileExtension}`;
  }
}

module.exports = {
  uploadToS3,
  isConfigured: () => isConfigured
};

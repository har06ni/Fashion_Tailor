const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (base64Image) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: 'tailor_shop',
      resource_type: 'auto'
    });
    return uploadResponse.secure_url;
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    throw err;
  }
};

module.exports = { uploadImage };

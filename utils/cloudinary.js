const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (fileBuffer, folder = 'workbook', fileName = 'material') => {
    try {
        const b64 = Buffer.from(fileBuffer).toString('base64');
        const dataURI = `data:application/pdf;base64,${b64}`;

        // Sanitize material name
        const sanitizedName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        // Unique suffix to prevent Cloudinary overwriting conflicts
        const suffix = Math.round(Math.random() * 1E4);
        const public_id = `${sanitizedName}_${suffix}`;

        const options = {
            folder,
            resource_type: 'image',
            type: 'upload',
            access_mode: 'public',
            public_id: public_id,
            format: 'pdf' // Ensure it stays a PDF
        };

        const result = await cloudinary.uploader.upload(dataURI, options);
        return result;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
};

module.exports = { uploadImage };

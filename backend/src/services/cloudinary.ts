import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';

export function cloudinaryConfigured() { return Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret); }
export function configureCloudinary() {
  cloudinary.config({ cloud_name: config.cloudinary.cloudName, api_key: config.cloudinary.apiKey, api_secret: config.cloudinary.apiSecret });
}
export async function uploadImage(path: string) {
  if (!cloudinaryConfigured()) return { demo: true, secure_url: path };
  configureCloudinary();
  return cloudinary.uploader.upload(path, { folder: 'gist-grip-brands' });
}

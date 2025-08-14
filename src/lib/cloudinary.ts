// Cloudinary configuration
export const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Server-side only
  upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

// Cloudinary URL builder for optimized images
export const getCloudinaryUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "jpg" | "png";
    crop?: "fill" | "scale" | "fit" | "thumb";
  } = {}
) => {
  const {
    width,
    height,
    quality = 80,
    format = "auto",
    crop = "fill",
  } = options;

  let url = `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload`;

  // Add transformations
  const transformations = [];

  if (width || height) {
    const size = [];
    if (width) size.push(`w_${width}`);
    if (height) size.push(`h_${height}`);
    if (crop) size.push(`c_${crop}`);
    transformations.push(size.join(","));
  }

  if (quality !== 80) {
    transformations.push(`q_${quality}`);
  }

  if (format !== "auto") {
    transformations.push(`f_${format}`);
  }

  if (transformations.length > 0) {
    url += `/${transformations.join("/")}`;
  }

  url += `/${publicId}`;

  return url;
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/.*?\/(.+)$/);
  return match ? match[1] : null;
};

// Helper function to get optimized course image URL
export const getCourseImageUrl = (
  imageUrl: string,
  width: number = 400,
  height: number = 225
) => {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
    return imageUrl; // Return original URL if not Cloudinary
  }

  const publicId = extractPublicId(imageUrl);
  if (!publicId) {
    return imageUrl; // Return original URL if can't extract public ID
  }

  return getCloudinaryUrl(publicId, {
    width,
    height,
    quality: 85,
    format: "auto",
    crop: "fill",
  });
};

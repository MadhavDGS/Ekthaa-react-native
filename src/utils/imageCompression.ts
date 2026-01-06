/**
 * Image Compression Utility
 * Compresses images before upload to save bandwidth and storage
 */

import * as ImageManipulator from 'expo-image-manipulator';

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
}

export const compressImage = async (
  uri: string,
  options: CompressOptions = {}
): Promise<string> => {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.7,
  } = options;

  try {
    console.log('📸 Compressing image...', uri);
    console.log('📸 Max dimensions:', maxWidth, 'x', maxHeight, 'Quality:', quality);

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    console.log('✅ Image compressed successfully');
    console.log('📸 Original URI:', uri);
    console.log('📸 Compressed URI:', manipResult.uri);

    return manipResult.uri;
  } catch (error) {
    console.error('❌ Image compression failed:', error);
    // Return original URI if compression fails
    return uri;
  }
};

export const compressProfilePhoto = async (uri: string): Promise<string> => {
  return compressImage(uri, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.8,
  });
};

export const compressProductPhoto = async (uri: string): Promise<string> => {
  return compressImage(uri, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.75,
  });
};

export const compressInvoicePhoto = async (uri: string): Promise<string> => {
  return compressImage(uri, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
  });
};

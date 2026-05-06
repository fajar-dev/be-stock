import { minioClient } from '../../config/minio';
import { config } from '../../config/config';
import type { ItemBucketMetadata } from 'minio';

export class MinioHelper {
    static get bucketName(): string {
        return config.minio.bucketName;
    }

    /**
     * Generate a presigned URL for downloading or viewing a file.
     * @param objectName - The name/path of the object in the bucket.
     * @param expiry - Expiry time in seconds (default 24 hours).
     */
    static async getPresignedUrl(objectName: string, expiry: number = 24 * 60 * 60): Promise<string> {
        return await minioClient.presignedGetObject(this.bucketName, objectName, expiry);
    }

    /**
     * Generate a presigned URL for uploading a file directly from the frontend client.
     * @param objectName - The name/path of the object in the bucket.
     * @param expiry - Expiry time in seconds (default: 5 minutes).
     */
    static async getPresignedPutUrl(objectName: string, expiry: number = 5 * 60): Promise<string> {
        return await minioClient.presignedPutObject(this.bucketName, objectName, expiry);
    }

    /**
     * Upload a file directly from the backend.
     * @param objectName - The name/path of the object in the bucket.
     * @param buffer - The file data as a Buffer.
     * @param contentType - Optional MIME type of the file.
     */
    static async uploadFile(objectName: string, buffer: Buffer, contentType: string = 'application/octet-stream'): Promise<any> {
        const metaData: ItemBucketMetadata = {
            'Content-Type': contentType,
        };
        return await minioClient.putObject(this.bucketName, objectName, buffer, undefined, metaData);
    }

    /**
     * Upload a File object (e.g. from multipart form) under the given folder prefix.
     * Returns the stored object name (path in bucket).
     */
    static async uploadFromFile(file: File, folder: string = 'uploads'): Promise<string> {
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split('.').pop() || 'bin';
        const objectName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`;
        await this.uploadFile(objectName, buffer, file.type);
        return objectName;
    }

    /**
     * Delete a file from the bucket.
     * @param objectName - The name/path of the object in the bucket.
     */
    static async deleteFile(objectName: string): Promise<void> {
        await minioClient.removeObject(this.bucketName, objectName);
    }

    /**
     * Get a direct public URL for a file (assumes bucket policy allows public read).
     * @param objectName - The name/path of the object in the bucket.
     */
    static getPublicUrl(objectName: string): string {
        const protocol = config.minio.useSSL ? 'https' : 'http';
        
        // If port is 80 or 443, we typically omit it from the URL
        const isStandardPort = (protocol === 'http' && config.minio.port === 80) || 
                               (protocol === 'https' && config.minio.port === 443);
                               
        const portSuffix = isStandardPort ? '' : `:${config.minio.port}`;
        
        return `${protocol}://${config.minio.endpoint}${portSuffix}/${this.bucketName}/${objectName}`;
    }
}

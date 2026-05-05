import * as Minio from 'minio';
import { config } from './config';

export const minioClient = new Minio.Client({
    endPoint: config.minio.endpoint,
    port: config.minio.port,
    useSSL: config.minio.useSSL,
    accessKey: config.minio.accessKey,
    secretKey: config.minio.secretKey,
});

/**
 * Ensure the default bucket exists.
 */
export async function initializeMinio() {
    const bucketName = config.minio.bucketName;
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`[Minio] Bucket '${bucketName}' created successfully.`);
            
            // Set bucket policy to allow public read access if needed
            // This is optional depending on requirements, but useful for image display.
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: ['s3:GetObject'],
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Resource: [`arn:aws:s3:::${bucketName}/*`],
                    },
                ],
            };
            await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
            console.log(`[Minio] Bucket '${bucketName}' policy set to public read.`);
        } else {
            console.log(`[Minio] Bucket '${bucketName}' already exists.`);
        }
    } catch (err) {
        console.warn('[Minio] Initialization failed. Minio might not be running or accessible. Continuing without Minio.', err);
    }
}

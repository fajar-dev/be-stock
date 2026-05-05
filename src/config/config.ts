/**
 * Global Application Configuration
 * All environment variables are centralized here
 */
export const config = {
    app: {
        port: Number(process.env.PORT) || 3000,
        env: process.env.NODE_ENV || 'development',
    },
    database: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        pass: process.env.DB_PASS || '',
        name: process.env.DB_NAME || 'be_stock',
        sync: Boolean(process.env.DB_SYNC) || false,
    },
    minio: {
        endpoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
        port: Number(process.env.MINIO_PORT) || 9000,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        bucketName: process.env.MINIO_BUCKET_NAME || 'stock-app',
    }
}

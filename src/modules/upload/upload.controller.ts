import { Context } from 'hono';
import { MinioHelper } from '../../core/helpers/minio';
import { ApiResponse } from '../../core/helpers/response';
import { BadRequestException } from '../../core/exceptions/base';

const ALLOWED_FOLDERS = ['stocks', 'stock-variants'] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

export class UploadController {
    async presigned(c: Context) {
        const folder = c.req.query('folder') as AllowedFolder;
        const ext = c.req.query('ext') || 'jpg';

        if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
            throw new BadRequestException(`folder must be one of: ${ALLOWED_FOLDERS.join(', ')}`);
        }

        const objectName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`;
        const uploadUrl = await MinioHelper.getPresignedPutUrl(objectName);

        return ApiResponse.success(c, { uploadUrl, objectName }, 'Presigned URL generated', 200);
    }
}

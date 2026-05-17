import { Context } from 'hono';
import { MinioHelper } from '../../core/helpers/minio';
import { ApiResponse } from '../../core/helpers/response';
import { BadRequestException } from '../../core/exceptions/base';

const ALLOWED_FOLDERS = ['stocks', 'stock-variants'] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

export class UploadController {
    async store(c: Context) {
        const folder = c.req.query('folder') as AllowedFolder;

        if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
            throw new BadRequestException(`folder must be one of: ${ALLOWED_FOLDERS.join(', ')}`);
        }

        const body = await c.req.parseBody();
        const file = body['file'];

        if (!(file instanceof File)) {
            throw new BadRequestException('file is required');
        }

        const objectName = await MinioHelper.uploadFromFile(file, folder);

        return ApiResponse.success(c, { objectName }, 'File uploaded successfully', 201);
    }
}

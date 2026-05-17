import { StockVariant } from '../entities/stock-variant.entity';
import { MinioHelper } from '../../../core/helpers/minio';

export class StockVariantSerializer {
    static async single(variant: StockVariant) {
        let photoUrl = variant.photo ?? null;
        if (photoUrl && !photoUrl.startsWith('http')) {
            photoUrl = await MinioHelper.getPresignedUrl(photoUrl);
        }

        return {
            id: variant.id,
            code: variant.code,
            name: variant.name,
            photo: photoUrl,
            description: variant.description ?? null,
            stock: variant.stock ? { id: variant.stock.id, code: variant.stock.code, name: variant.stock.name, managementModel: variant.stock.managementModel } : null,
            createdAt: variant.createdAt,
        };
    }

    static async collection(variants: StockVariant[]) {
        return Promise.all(variants.map(v => this.single(v)));
    }
}

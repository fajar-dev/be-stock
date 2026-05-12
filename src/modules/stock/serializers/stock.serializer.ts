import { Stock } from '../entities/stock.entity';
import { MinioHelper } from '../../../core/helpers/minio';

export class StockSerializer {
    static async single(stock: Stock) {
        let photoUrl = stock.photo;
        if (photoUrl && !photoUrl.startsWith('http')) {
            photoUrl = await MinioHelper.getPresignedUrl(photoUrl);
        }

        return {
            id: stock.id,
            code: stock.code,
            name: stock.name,
            managementModel: stock.managementModel,
            itemType: stock.itemType,
            toolType: stock.toolType,
            category: stock.category,
            photo: photoUrl,
            description: stock.description,
            createdAt: stock.createdAt,
            baseConversion: stock.baseConversion ? {
                id: stock.baseConversion.id,
                name: stock.baseConversion.name,
            } : null,
            conversions: stock.stockConversions?.map(sc => ({
                id: sc.conversion?.id,
                name: sc.conversion?.name,
                remark: `1 ${sc.conversion?.unitBasic?.name || ''} = ${Number(sc.conversion?.value)} ${sc.conversion?.unitConversion?.name || ''}`,
            })) || []
        };
    }

    static async collection(stocks: Stock[]) {
        return Promise.all(stocks.map(s => this.single(s)));
    }
}

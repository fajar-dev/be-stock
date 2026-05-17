import { DataSource, Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { IStockRepository } from './stock.interface';
import { CreateStockValidator } from './validators/stock.validators';

export class StockRepository implements IStockRepository {
    private readonly repo: Repository<Stock>;

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Stock);
    }

    findAll(page: number, limit: number, query: string): Promise<[Stock[], number]> {
        let queryBuilder = this.repo.createQueryBuilder('stock') 
            .leftJoinAndSelect('stock.baseConversion', 'baseConversion')
            .leftJoinAndSelect('baseConversion.unitBasic', 'baseConversionUnit')
            .leftJoinAndSelect('stock.stockConversions', 'stockConversions')
            .leftJoinAndSelect('stockConversions.conversion', 'conversion')
            .leftJoinAndSelect('conversion.unitBasic', 'unitBasic')
            .leftJoinAndSelect('conversion.unitConversion', 'unitConversion')
            .orderBy('stock.createdAt', 'DESC')
            .where("stock.name LIKE :query", { query: `%${query}%` })
            .skip((page - 1) * limit)
            .take(limit);

        return queryBuilder.getManyAndCount();
    }

    findById(id: number): Promise<Stock | null> {
        return this.repo.findOne({ 
            where: { id }, 
            relations: [
                'baseConversion',
                'baseConversion.unitBasic',
                'stockConversions',
                'stockConversions.conversion',
                'stockConversions.conversion.unitBasic',
                'stockConversions.conversion.unitConversion'
            ]
        });
    }

    findByCode(code: string): Promise<Stock | null> {
        return this.repo.findOne({ where: { code } });
    }

    async create(data: CreateStockValidator): Promise<Stock> {
        const { conversionUnit, ...stockData } = data;
        
        const stock = this.repo.create({ ...stockData });
        
        if (conversionUnit && conversionUnit.length > 0) {
            stock.stockConversions = conversionUnit.map(id => ({
                conversionId: id
            } as any));
        }
        
        const savedStock = await this.repo.save(stock);
        return this.findById(savedStock.id) as Promise<Stock>;
    }
}

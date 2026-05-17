import 'reflect-metadata'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { DataSource } from 'typeorm'
import { zValidator } from '@hono/zod-validator'

import { validationHook } from '../../src/core/helpers/validator'
import { BaseException } from '../../src/core/exceptions/base'
import { ApiResponse } from '../../src/core/helpers/response'

import { Stock } from '../../src/modules/stock/entities/stock.entity'
import { StockConversion } from '../../src/modules/stock/entities/stock-conversion.entity'
import { Unit } from '../../src/modules/unit/entities/unit.entity'
import { Conversion } from '../../src/modules/conversion/entities/conversion.entity'
import { StockVariant } from '../../src/modules/stock-variant/entities/stock-variant.entity'
import { StockVariantBranch } from '../../src/modules/stock-variant/entities/stock-variant-branch.entity'
import { StockVariantItem } from '../../src/modules/stock-variant-item/entities/stock-variant-item.entity'
import { Branch } from '../../src/modules/branch/entities/branch.entity'

import { createUnitController } from '../../src/modules/unit/unit.module'
import { createConversionController } from '../../src/modules/conversion/conversion.module'
import { createStockController } from '../../src/modules/stock/stock.module'
import { createStockVariantController } from '../../src/modules/stock-variant/stock-variant.module'
import { createStockVariantItemController } from '../../src/modules/stock-variant-item/stock-variant-item.module'
import { createBranchController } from '../../src/modules/branch/branch.module'
import { createAdditionalController } from '../../src/modules/additional/additional.module'
import { UploadController } from '../../src/modules/upload/upload.controller'

import { PaginationSchema } from '../../src/core/validators/pagination.schema'
import { CreateUnitSchema } from '../../src/modules/unit/validators/unit.validators'
import { CreateConversionSchema } from '../../src/modules/conversion/validators/conversion.validators'
import { CreateStockSchema } from '../../src/modules/stock/validators/stock.validators'
import { CreateStockVariantSchema } from '../../src/modules/stock-variant/validators/stock-variant.validators'
import { CreateStockVariantItemSchema } from '../../src/modules/stock-variant-item/validators/stock-variant-item.validators'
import { CreateBranchSchema } from '../../src/modules/branch/validators/branch.validators'

export function createTestDataSource(): DataSource {
    return new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_TEST_NAME || 'be_stock_test',
        synchronize: true,
        entities: [Stock, StockConversion, Unit, Conversion, StockVariant, StockVariantBranch, StockVariantItem, Branch],
        connectorPackage: 'mysql2',
        charset: 'utf8mb4_unicode_ci',
        extra: { multipleStatements: true },
        logging: false,
    })
}

export function createTestApp(dataSource: DataSource): Hono {
    const app = new Hono()
    app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }))

    const routes = new Hono()

    const uploadController = new UploadController()
    const unitController = createUnitController(dataSource)
    const conversionController = createConversionController(dataSource)
    const stockController = createStockController(dataSource)
    const stockVariantController = createStockVariantController(dataSource)
    const stockVariantItemController = createStockVariantItemController(dataSource)
    const branchController = createBranchController(dataSource)
    const additionalController = createAdditionalController(dataSource)

    routes.get('/upload/presigned', (c) => uploadController.presigned(c))

    routes.get('/unit', zValidator('query', PaginationSchema, validationHook), (c) => unitController.index(c))
    routes.get('/unit/:id', (c) => unitController.show(c))
    routes.post('/unit', zValidator('json', CreateUnitSchema, validationHook), (c) => unitController.store(c))

    routes.get('/conversion', zValidator('query', PaginationSchema, validationHook), (c) => conversionController.index(c))
    routes.get('/conversion/:id', (c) => conversionController.show(c))
    routes.post('/conversion', zValidator('json', CreateConversionSchema, validationHook), (c) => conversionController.store(c))

    routes.get('/stock', zValidator('query', PaginationSchema, validationHook), (c) => stockController.index(c))
    routes.get('/stock/:id', (c) => stockController.show(c))
    routes.post('/stock', zValidator('json', CreateStockSchema, validationHook), (c) => stockController.store(c))

    routes.get('/stock/:stockId/stock-variant', zValidator('query', PaginationSchema, validationHook), (c) => stockVariantController.byStock(c))
    routes.get('/stock-variant', zValidator('query', PaginationSchema, validationHook), (c) => stockVariantController.index(c))
    routes.get('/stock-variant/:id', (c) => stockVariantController.show(c))
    routes.post('/stock-variant', zValidator('json', CreateStockVariantSchema, validationHook), (c) => stockVariantController.store(c))

    routes.get('/stock-variant/:variantId/stock-variant-item', zValidator('query', PaginationSchema, validationHook), (c) => stockVariantItemController.byVariant(c))
    routes.get('/stock-variant-item', zValidator('query', PaginationSchema, validationHook), (c) => stockVariantItemController.index(c))
    routes.get('/stock-variant-item/:id', (c) => stockVariantItemController.show(c))
    routes.post('/stock-variant-item', zValidator('json', CreateStockVariantItemSchema, validationHook), (c) => stockVariantItemController.store(c))

    routes.get('/branch', zValidator('query', PaginationSchema, validationHook), (c) => branchController.index(c))
    routes.get('/branch/:id', (c) => branchController.show(c))
    routes.post('/branch', zValidator('json', CreateBranchSchema, validationHook), (c) => branchController.store(c))

    routes.get('/additional/conversion', (c) => additionalController.conversions(c))
    routes.get('/additional/base-conversion', (c) => additionalController.baseConversions(c))
    routes.get('/additional/branch', (c) => additionalController.branches(c))

    app.route('/api', routes)

    app.onError((err, c) => {
        if (err instanceof BaseException) {
            return ApiResponse.error(c, err.message, err.status, err.context)
        }
        return ApiResponse.error(c, 'Internal Server Error', 500, null)
    })

    return app
}

export function post(app: Hono, path: string, body: unknown) {
    return app.request(`/api${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
}

export function get(app: Hono, path: string) {
    return app.request(`/api${path}`)
}

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { AppDataSource } from '../config/database'
import { validationHook } from '../core/helpers/validator'
import { createUnitController } from '../modules/unit/unit.module'
import { CreateUnitSchema } from '../modules/unit/validators/unit.validators'
import { createConversionController } from '../modules/conversion/conversion.module'
import { CreateConversionSchema } from '../modules/conversion/validators/conversion.validators'
import { PaginationSchema } from '../core/validators/pagination.schema'
import { createStockController } from '../modules/stock/stock.module'
import { CreateStockSchema } from '../modules/stock/validators/stock.validators'
import { createStockVariantController } from '../modules/stock-variant/stock-variant.module'
import { CreateStockVariantSchema } from '../modules/stock-variant/validators/stock-variant.validators'
import { createAdditionalController } from '../modules/additional/additional.module'
import { createStockVariantItemController } from '../modules/stock-variant-item/stock-variant-item.module'
import { CreateStockVariantItemSchema } from '../modules/stock-variant-item/validators/stock-variant-item.validators'
import { createBranchController } from '../modules/branch/branch.module'
import { CreateBranchSchema } from '../modules/branch/validators/branch.validators'

const routes = new Hono()

const unitController = createUnitController(AppDataSource)
const conversionController = createConversionController(AppDataSource)
const stockController = createStockController(AppDataSource)
const stockVariantController = createStockVariantController(AppDataSource)
const additionalController = createAdditionalController(AppDataSource)
const stockVariantItemController = createStockVariantItemController(AppDataSource)
const branchController = createBranchController(AppDataSource)

routes.get('/unit', zValidator('query', PaginationSchema, validationHook), (c) => unitController.index(c))
routes.get('/unit/:id', (c) => unitController.show(c))
routes.post('/unit', zValidator('json', CreateUnitSchema, validationHook), (c) => unitController.store(c))

routes.get('/conversion', zValidator('query', PaginationSchema, validationHook), (c) => conversionController.index(c))
routes.get('/conversion/:id', (c) => conversionController.show(c))
routes.post('/conversion', zValidator('json', CreateConversionSchema, validationHook), (c) => conversionController.store(c))

routes.get('/stock', zValidator('query', PaginationSchema, validationHook), (c) => stockController.index(c))
routes.get('/stock/:id', (c) => stockController.show(c))
routes.post('/stock', zValidator('form', CreateStockSchema, validationHook), (c) => stockController.store(c))

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

export default routes

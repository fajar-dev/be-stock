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

const routes = new Hono()

const unitController = createUnitController(AppDataSource)
const conversionController = createConversionController(AppDataSource)
const stockController = createStockController(AppDataSource)

routes.get('/unit', zValidator('query', PaginationSchema, validationHook), (c) => unitController.index(c))
routes.get('/unit/:id', (c) => unitController.show(c))
routes.post('/unit', zValidator('json', CreateUnitSchema, validationHook), (c) => unitController.store(c))

routes.get('/conversion', zValidator('query', PaginationSchema, validationHook), (c) => conversionController.index(c))
routes.get('/conversion/:id', (c) => conversionController.show(c))
routes.post('/conversion', zValidator('json', CreateConversionSchema, validationHook), (c) => conversionController.store(c))

routes.get('/stock', zValidator('query', PaginationSchema, validationHook), (c) => stockController.index(c))
routes.get('/stock/:id', (c) => stockController.show(c))
routes.post('/stock', zValidator('json', CreateStockSchema, validationHook), (c) => stockController.store(c))

export default routes
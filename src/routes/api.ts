import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { AppDataSource } from '../config/database'
import { validationHook } from '../core/helpers/validator'
import { createStockController } from '../modules/stock/stock.module'
import { CreateStockSchema, UpdateStockSchema } from '../modules/stock/validators/stock.validators'
import { createUnitController } from '../modules/unit/unit.module'
import { CreateUnitSchema, UpdateUnitSchema } from '../modules/unit/validators/unit.validators'
import { PaginationSchema } from '../core/validators/pagination.schema'

const routes = new Hono()

const stockController = createStockController(AppDataSource)
const unitController = createUnitController(AppDataSource)

routes.get('/stocks', zValidator('query', PaginationSchema, validationHook), (c) => stockController.index(c))
routes.get('/stocks/:id', (c) => stockController.show(c))
routes.post('/stocks', zValidator('json', CreateStockSchema, validationHook), (c) => stockController.store(c))
routes.put('/stocks/:id', zValidator('json', UpdateStockSchema, validationHook), (c) => stockController.update(c))
routes.delete('/stocks/:id', (c) => stockController.destroy(c))

routes.get('/unit', zValidator('query', PaginationSchema, validationHook), (c) => unitController.index(c))
routes.get('/unit/:id', (c) => unitController.show(c))
routes.post('/unit', zValidator('json', CreateUnitSchema, validationHook), (c) => unitController.store(c))


export default routes
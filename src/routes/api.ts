import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { AppDataSource } from '../config/database'
import { validationHook } from '../core/helpers/validator'
import { createStockController } from '../modules/stock/stock.module'
import { CreateStockSchema, UpdateStockSchema } from '../modules/stock/validators/stock.validators'
import { PaginationSchema } from '../core/validators/pagination.schema'

const routes = new Hono()

const stockController = createStockController(AppDataSource)

routes.get('/stocks', zValidator('query', PaginationSchema, validationHook), (c) => stockController.index(c))
routes.get('/stocks/:id', (c) => stockController.show(c))
routes.post('/stocks', zValidator('json', CreateStockSchema, validationHook), (c) => stockController.store(c))
routes.put('/stocks/:id', zValidator('json', UpdateStockSchema, validationHook), (c) => stockController.update(c))
routes.delete('/stocks/:id', (c) => stockController.destroy(c))

export default routes
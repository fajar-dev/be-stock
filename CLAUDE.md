# Code Standards — Stock Backend

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **ORM**: TypeORM (MySQL / mysql2)
- **Validation**: Zod + @hono/zod-validator
- **Language**: TypeScript

---

## Project Structure

```
src/
├── index.ts                      # App entry — CORS, DB init (awaited), global error handler, route mount
├── config/
│   ├── config.ts                 # Centralized env config
│   └── database.ts               # TypeORM DataSource setup
├── core/
│   ├── exceptions/
│   │   └── base.ts               # BaseException + all HTTP exception classes
│   ├── helpers/
│   │   ├── response.ts           # ApiResponse formatter
│   │   └── validator.ts          # validationHook for zValidator
│   └── validators/
│       └── pagination.schema.ts  # Shared PaginationSchema + PaginationDto
├── routes/
│   └── api.ts                    # All route declarations (mounted at /api)
└── modules/
    └── <module>/                 # One folder per domain
        ├── <module>.module.ts    # Factory function — wires DI manually
        ├── <module>.controller.ts
        ├── <module>.service.ts
        ├── <module>.repository.ts
        ├── <module>.interface.ts
        ├── entities/
        │   └── <module>.entity.ts
        ├── validators/
        │   └── <module>.validators.ts
        └── serializers/
            └── <module>.serializer.ts
```

---

## Module Pattern

Every domain module follows this exact layering:

### 1. Entity (`entities/<name>.entity.ts`)
TypeORM entity class. Always include `uuid` PK, `createdAt`, `updatedAt`.

```ts
@Entity('table_name')
export class Stock {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ length: 150 })
    name!: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date
}
```

### 2. Validators (`validators/<name>.validators.ts`)
Zod schemas + inferred DTO types. `UpdateSchema` is always `.partial()` of `CreateSchema`.

```ts
export const CreateStockSchema = z.object({ ... })
export const UpdateStockSchema = CreateStockSchema.partial()
export const PaginationSchema = z.object({ page: z.coerce.number()..., limit: z.coerce.number()... })

export type CreateStockDto = z.infer<typeof CreateStockSchema>
export type UpdateStockDto = z.infer<typeof UpdateStockSchema>
export type PaginationDto   = z.infer<typeof PaginationSchema>
```

### 3. Interface (`<name>.interface.ts`)
Repository contract. Service depends on this interface, not the concrete class.

```ts
export interface IStockRepository {
    findAll(page: number, limit: number): Promise<[Stock[], number]>
    findById(id: string): Promise<Stock | null>
    create(data: CreateStockDto): Promise<Stock>
    update(id: string, data: UpdateStockDto): Promise<Stock>
    delete(id: string): Promise<void>
}
```

### 4. Repository (`<name>.repository.ts`)
Implements the interface. Receives `DataSource` in constructor, no business logic here.

```ts
export class StockRepository implements IStockRepository {
    private readonly repo: Repository<Stock>

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Stock)
    }

    findAll(page: number, limit: number): Promise<[Stock[], number]> {
        return this.repo.findAndCount({
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        })
    }
    // ...
}
```

### 5. Service (`<name>.service.ts`)
Business logic. Depends on the interface (not concrete repo). Throws exceptions here.

```ts
export class StockService {
    constructor(private readonly repository: IStockRepository) {}

    async getById(id: string) {
        const stock = await this.repository.findById(id)
        if (!stock) throw new NotFoundException(`Stock with id '${id}' not found`)
        return stock
    }
}
```

### 6. Serializer (`serializers/<name>.serializer.ts`)
Static class. Always expose `single()` and `collection()`. Controls what JSON shape the API returns. Cast types here (e.g., `Number(stock.price)`).

```ts
export class StockSerializer {
    static single(stock: Stock) {
        return { id: stock.id, price: Number(stock.price), ... }
    }
    static collection(stocks: Stock[]) {
        return stocks.map(s => this.single(s))
    }
}
```

### 7. Controller (`<name>.controller.ts`)
HTTP layer only. No business logic. Method names: `index`, `show`, `store`, `update`, `destroy`.

```ts
export class StockController {
    constructor(private readonly service: StockService) {}

    async index(c: Context) { /* list */ }
    async show(c: Context)  { /* single */ }
    async store(c: Context) { /* create */ }
    async update(c: Context){ /* update */ }
    async destroy(c: Context){ /* delete */ }
}
```

### 8. Module (`<name>.module.ts`)
Factory function for manual DI. Always named `create<Name>Controller`.

```ts
export function createStockController(dataSource: DataSource): StockController {
    const repository = new StockRepository(dataSource)
    const service    = new StockService(repository)
    return new StockController(service)
}
```

---

## Routes (`src/routes/api.ts`)

All routes declared here, mounted at `/api` in `index.ts`. Use `zValidator` + `validationHook` for request validation. Always wrap controller methods in arrow functions to preserve `this` context.

```ts
routes.get('/stocks',      zValidator('query', PaginationSchema, validationHook), (c) => stockController.index(c))
routes.get('/stocks/:id',  (c) => stockController.show(c))
routes.post('/stocks',     zValidator('json', CreateStockSchema, validationHook), (c) => stockController.store(c))
routes.put('/stocks/:id',  zValidator('json', UpdateStockSchema, validationHook), (c) => stockController.update(c))
routes.delete('/stocks/:id', (c) => stockController.destroy(c))
```

In controllers, access validated data via `c.req.valid()` — bukan `c.req.query()`/`c.req.json()`:

```ts
// ✅ Gunakan data hasil validasi Zod
const { page, limit } = c.req.valid('query' as never) as PaginationDto
const dto = await c.req.json<CreateStockDto>()
```

---

## Response Format

Use `ApiResponse` for all responses. Never call `c.json()` directly in controllers.

```ts
// Single resource
ApiResponse.success(c, StockSerializer.single(data), 'Message', 201)

// Paginated list
ApiResponse.paginate(c, StockSerializer.collection(data), total, page, limit, 'Message')

// Error (handled globally — throw exceptions in service instead)
ApiResponse.error(c, 'Message', 500, errors)
```

Response shape:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": { ... },
  "meta": { "total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1, "from": 1, "to": 0 }
}
```

---

## Exceptions

Throw from service layer. The global error handler in `index.ts` catches all `BaseException` subclasses.

| Class | Status |
|---|---|
| `BadRequestException` | 400 |
| `UnauthorizedException` | 401 |
| `ForbiddenException` | 403 |
| `NotFoundException` | 404 |
| `ConflictException` | 409 |
| `ValidatorException` | 422 |
| `TooManyValidatorsException` | 429 |

```ts
throw new NotFoundException(`Stock with id '${id}' not found`)
throw new ConflictException(`SKU '${sku}' already exists`)
```

---

## Adding a New Module — Checklist

1. Create folder `src/modules/<name>/`
2. `entities/<name>.entity.ts` — TypeORM entity
3. `validators/<name>.validators.ts` — Zod schemas + DTO types
4. `<name>.interface.ts` — repository interface
5. `<name>.repository.ts` — implements interface
6. `<name>.service.ts` — business logic, uses interface
7. `serializers/<name>.serializer.ts` — `single()` + `collection()`
8. `<name>.controller.ts` — HTTP handlers
9. `<name>.module.ts` — `create<Name>Controller(dataSource)` factory
10. Register entity in `src/config/database.ts` → `entities: [Stock, NewEntity]`
11. Add routes to `src/routes/api.ts`

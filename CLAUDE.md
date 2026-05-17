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
│   ├── config.ts                 # Centralized env config (DB + MinIO env vars)
│   ├── database.ts               # TypeORM DataSource setup
│   └── minio.ts                  # MinIO client init + initializeMinio() (bucket auto-create)
├── core/
│   ├── exceptions/
│   │   └── base.ts               # BaseException + all HTTP exception classes
│   ├── helpers/
│   │   ├── response.ts           # ApiResponse formatter
│   │   ├── validator.ts          # validationHook for zValidator
│   │   └── minio.ts              # MinioHelper static class (upload, presign, delete, publicUrl)
│   └── validators/
│       └── pagination.schema.ts  # Shared PaginationSchema + PaginationValidator
├── routes/
│   └── api.ts                    # All route declarations (mounted at /api)
└── modules/
    ├── upload/
    │   └── upload.controller.ts  # GET /upload/presigned — generates pre-signed PUT URL for MinIO
    └── <module>/                 # One folder per domain
        ├── <module>.module.ts    # Factory function — wires DI manually
        ├── <module>.controller.ts
        ├── <module>.service.ts
        ├── <module>.repository.ts
        ├── <module>.interface.ts
        ├── <module>.enum.ts      # (optional) Domain enums — only if module has fixed classifications
        ├── entities/
        │   └── <module>.entity.ts  # Can contain multiple entity files (e.g. join-table entities)
        ├── validators/
        │   └── <module>.validators.ts
        └── serializers/
            └── <module>.serializer.ts
```

---

## Module Pattern

Every domain module follows this exact layering:

### 1. Entity (`entities/<name>.entity.ts`)

TypeORM entity class. Always include `id` (PK), `createdAt`, `updatedAt`.

```ts
@Entity("table_name")
export class Stock {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
```

### 2. Validators (`validators/<name>.validators.ts`)

Zod schemas + inferred Validator types. `UpdateSchema` is always `.partial()` of `CreateSchema`.

```ts
export const CreateStockSchema = z.object({ ... })
export const UpdateStockSchema = CreateStockSchema.partial()
export const PaginationSchema = z.object({ page: z.coerce.number()..., limit: z.coerce.number()... })

export type CreateStockValidator = z.infer<typeof CreateStockSchema>
export type UpdateStockValidator = z.infer<typeof UpdateStockSchema>
export type PaginationValidator   = z.infer<typeof PaginationSchema>
```

### 3. Interface (`<name>.interface.ts`)

Repository contract. Service depends on this interface, not the concrete class.

```ts
export interface IStockRepository {
  findAll(page: number, limit: number): Promise<[Stock[], number]>;
  findById(id: string): Promise<Stock | null>;
  create(data: CreateStockValidator): Promise<Stock>;
  update(id: string, data: UpdateStockValidator): Promise<Stock>;
  delete(id: string): Promise<void>;
}
```

### 2b. Enum File (`<name>.enum.ts`) — optional

Only create when the module has domain-specific fixed classifications. Export all related enums from one file.

```ts
export enum ItemType {
  PERALATAN = "Peralatan",
  SETUP = "setup",
}

export enum Category {
  ASET = "Aset",
  BIAYA = "Biaya",
}
```

---

### 4. Repository (`<name>.repository.ts`)

Implements the interface. Receives `DataSource` in constructor, no business logic here.

```ts
export class StockRepository implements IStockRepository {
  private readonly repo: Repository<Stock>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Stock);
  }

  findAll(page: number, limit: number): Promise<[Stock[], number]> {
    return this.repo.findAndCount({
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
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
    const stock = await this.repository.findById(id);
    if (!stock) throw new NotFoundException(`Stock with id '${id}' not found`);
    return stock;
  }
}
```

**Cross-module dependencies**: Services may depend on repository interfaces from other modules for validation. Always use the interface, never the concrete class.

```ts
export class StockService {
  constructor(
    private readonly repository: IStockRepository,
    private readonly conversionRepository: IConversionRepository, // from another module
  ) {}
}
```

**Transactions with auto-create side effects**: When creating one entity must atomically create another, inject `DataSource` and use `dataSource.transaction()`.

```ts
export class UnitService {
  constructor(
    private readonly repository: IUnitRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(validator: CreateUnitValidator): Promise<Unit> {
    return this.dataSource.transaction(async (manager) => {
      const unit = await manager.save(manager.create(Unit, validator));
      // auto-create base conversion for every new unit
      await manager.save(
        manager.create(Conversion, {
          name: unit.name,
          unitBasicId: unit.id,
          unitConversionId: unit.id,
          value: 1,
          isBaseConversion: true,
          isActive: true,
        }),
      );
      return unit;
    });
  }
}
```

When a service uses transactions, update its module factory and interface accordingly to pass `DataSource`.

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

  async index(c: Context) {
    /* list */
  }
  async show(c: Context) {
    /* single */
  }
  async store(c: Context) {
    /* create */
  }
  async update(c: Context) {
    /* update */
  }
  async destroy(c: Context) {
    /* delete */
  }
}
```

### 8. Module (`<name>.module.ts`)

Factory function for manual DI. Always named `create<Name>Controller`.

```ts
export function createStockController(dataSource: DataSource): StockController {
  const repository = new StockRepository(dataSource);
  const service = new StockService(repository);
  return new StockController(service);
}
```

---

## Routes (`src/routes/api.ts`)

All routes declared here, mounted at `/api` in `index.ts`. Use `zValidator` + `validationHook` for request validation. Always wrap controller methods in arrow functions to preserve `this` context.

```ts
routes.get(
  "/stocks",
  zValidator("query", PaginationSchema, validationHook),
  (c) => stockController.index(c),
);
routes.get("/stocks/:id", (c) => stockController.show(c));
routes.post(
  "/stocks",
  zValidator("json", CreateStockSchema, validationHook),
  (c) => stockController.store(c),
);
routes.put(
  "/stocks/:id",
  zValidator("json", UpdateStockSchema, validationHook),
  (c) => stockController.update(c),
);
routes.delete("/stocks/:id", (c) => stockController.destroy(c));
```

The `zValidator` second argument determines the data source:

- `'query'` — query string params
- `'json'` — request body as JSON

In controllers, access validated data via `c.req.valid()` — bukan `c.req.query()`/`c.req.json()`:

```ts
// ✅ Gunakan data hasil validasi Zod
const { page, limit } = c.req.valid("query" as never) as PaginationValidator;
const validator = await c.req.json<CreateStockValidator>();
```

---

## Response Format

Use `ApiResponse` for all responses. Never call `c.json()` directly in controllers.

```ts
// Single resource
ApiResponse.success(c, StockSerializer.single(data), "Message", 201);

// Paginated list
ApiResponse.paginate(
  c,
  StockSerializer.collection(data),
  total,
  page,
  limit,
  "Message",
);

// Error (handled globally — throw exceptions in service instead)
ApiResponse.error(c, "Message", 500, errors);
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

| Class                        | Status |
| ---------------------------- | ------ |
| `BadRequestException`        | 400    |
| `UnauthorizedException`      | 401    |
| `ForbiddenException`         | 403    |
| `NotFoundException`          | 404    |
| `ConflictException`          | 409    |
| `ValidatorException`         | 422    |
| `TooManyValidatorsException` | 429    |

```ts
throw new NotFoundException(`Stock not found`);
throw new ConflictException(`SKU already exists`);
```

---

## MinIO Integration

MinIO is used for S3-compatible file storage. It is initialized on app startup alongside the DB.

**Config** (`src/config/minio.ts`): Creates the MinIO client and exports `initializeMinio()` which auto-creates the bucket with public-read policy if it doesn't exist.

**Helper** (`src/core/helpers/minio.ts`): Static `MinioHelper` class — use this in serializers and the upload controller.

```ts
// Generate presigned PUT URL for direct client upload
const uploadUrl = await MinioHelper.getPresignedPutUrl(objectName);

// Generate presigned GET URL — used in serializers to serve photos
const url = await MinioHelper.getPresignedUrl(objectName);

// Delete a file
await MinioHelper.deleteFile(objectName);
```

**Required env vars** (all have defaults for local dev):
| Variable | Default |
|---|---|
| `MINIO_ENDPOINT` | `127.0.0.1` |
| `MINIO_PORT` | `9000` |
| `MINIO_USE_SSL` | `false` |
| `MINIO_ACCESS_KEY` | `minioadmin` |
| `MINIO_SECRET_KEY` | `minioadmin` |
| `MINIO_BUCKET_NAME` | `stock-app` |

---

## File Upload Pattern

File upload **tidak dilakukan di dalam entity endpoint**. Gunakan pre-signed PUT URL agar client upload langsung ke MinIO tanpa melewati server.

**Flow:**

```
1. GET /api/upload/presigned?folder=stocks&ext=jpg
   ← { uploadUrl: "https://minio/...?X-Amz-...", objectName: "stocks/xyz.jpg" }

2. PUT {uploadUrl}          ← client upload langsung ke MinIO (bypass server)
   Content-Type: image/jpeg
   body: <binary>

3. POST /api/stock          ← JSON body, photo sudah berupa string objectName
   { "photo": "stocks/xyz.jpg", ... }
```

**Aturan:**

- Field `photo` di validator selalu `z.string().optional().nullable()` — bukan `z.instanceof(File)`
- Services tidak pernah memanggil MinioHelper untuk upload/move; MinioHelper hanya dipanggil di serializer (untuk generate presigned GET URL saat response)
- Folder yang diizinkan didefinisikan di `upload.controller.ts` → `ALLOWED_FOLDERS`
- Untuk menambah folder baru, tambahkan ke array `ALLOWED_FOLDERS`

**Serializer dengan foto** — generate presigned GET URL saat serialisasi:

```ts
static async single(entity: Entity) {
    let photoUrl = entity.photo ?? null;
    if (photoUrl && !photoUrl.startsWith('http')) {
        photoUrl = await MinioHelper.getPresignedUrl(photoUrl);
    }
    return { ...entity, photo: photoUrl };
}

static async collection(entities: Entity[]) {
    return Promise.all(entities.map(e => this.single(e)));
}
```

Karena `single()` async, controller harus `await` serializer:

```ts
return ApiResponse.success(
  c,
  await EntitySerializer.single(data),
  "Message",
  200,
);
return ApiResponse.paginate(
  c,
  await EntitySerializer.collection(data),
  total,
  page,
  limit,
  "Message",
);
```

---

## Lightweight Module Pattern

For read-only helper modules (dropdowns, search filters) that query existing entities from other modules — not a full CRUD domain. Skip entity, interface, validators, and serializer.

**Minimal structure**:

```
modules/additional/
├── additional.controller.ts   # reads raw c.req.query('q')
├── additional.service.ts
├── additional.repository.ts   # no interface needed
└── additional.module.ts
```

Repository uses `DataSource` directly (no interface). Service depends on concrete repository. Controller reads raw query params (`c.req.query('q')`) without Zod validation. No serializer — return data as-is or shape inline.

Routes have no `zValidator` middleware:

```ts
routes.get("/additional/conversion", (c) =>
  additionalController.conversions(c),
);
routes.get("/additional/base-conversion", (c) =>
  additionalController.baseConversions(c),
);
```

Use this pattern only when the module is purely a helper with no writes and no owned entities.

---

## Tests

Tests are E2E using `bun:test`. Each test file spins up a real in-memory app + DB, seeds data in `beforeAll`, and tears down in `afterAll`. No unit tests, no mocks except MinIO.

**File location**: `tests/<module>.test.ts`

**Boilerplate**:

```ts
import { describe, test, expect, beforeAll, afterAll, jest } from 'bun:test'
import { createTestDataSource, createTestApp, get, post } from './helpers/app'
import { MinioHelper } from '../src/core/helpers/minio'

jest.spyOn(MinioHelper, 'getPresignedUrl').mockResolvedValue('http://mock-minio/photo.jpg')

const dataSource = createTestDataSource()
const app = createTestApp(dataSource)
const uid = Date.now()   // prevents collisions between test runs

let resourceId: number

beforeAll(async () => {
    await dataSource.initialize()
    // seed dependencies here
})
afterAll(async () => { await dataSource.destroy() })

describe('ModuleName', () => {
    test('POST /resource — create', async () => { ... })
    test('POST /resource — 409 duplicate', async () => { ... })
    test('GET /resource — list', async () => { ... })
    test('GET /resource/:id — detail', async () => { ... })
    test('GET /resource/:id — 404 not found', async () => { ... })
})
```

**Rules**:

- Always mock MinIO when the module has a `photo` field
- Use `uid = Date.now()` suffix on all seeded codes/names to avoid collisions
- Seed all dependencies (unit → conversion → stock → etc.) in `beforeAll` before the module under test
- Every new route must be registered in **both** `src/routes/api.ts` and `tests/helpers/app.ts`
- Test happy path + key error cases (404, 409, 400, 422) — don't test every edge case
- For modules that shape data (e.g. additional endpoints), assert the response shape fields explicitly

```ts
// assert shape for additional/variant
expect(Array.isArray(item.conversion)).toBe(true)
expect(item.stock.managementModel).toBe('UNIK')
```

---

## Swagger (`swagger.yml`)

All endpoints are documented in `swagger.yml` at the project root using OpenAPI 3.0.

**Adding an endpoint** — follow this structure:

```yaml
  /resource:
    post:
      tags: [TagName]
      summary: Short action description
      description: |
        Longer explanation if needed.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateResourceRequest"
            example:
              field: value
      responses:
        "201":
          description: Resource created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ResourceSuccessResponse"
        "400":
          $ref: "#/components/responses/BadRequest"
        "409":
          $ref: "#/components/responses/Conflict"
        "422":
          $ref: "#/components/responses/ValidationError"
```

**Schema naming conventions**:

| Schema | Purpose |
|---|---|
| `Create<Module>Request` | POST request body |
| `Update<Module>Request` | PUT request body |
| `<Module>Object` | Single resource shape |
| `<Module>SuccessResponse` | `SuccessWrapper` + single object |
| `<Module>CollectionResponse` | `SuccessWrapper` + array |
| `<Module>PaginatedResponse` | `PaginatedWrapper` + array |
| `Additional<Name>Item` | Lightweight helper response item |
| `Additional<Name>ListResponse` | `SuccessWrapper` + array of above |

**Shared wrappers** — always use `$ref`, never repeat the wrapper structure inline:

```yaml
ResourceSuccessResponse:
  allOf:
    - $ref: "#/components/schemas/SuccessWrapper"
    - type: object
      properties:
        data:
          $ref: "#/components/schemas/ResourceObject"
```

**Rules**:

- Always include an inline `example:` on every endpoint (not just the schema)
- Use `$ref: "#/components/responses/BadRequest|NotFound|Conflict|ValidationError"` for standard errors
- Add new schemas in `components/schemas` grouped by module with a comment header `# ── MODULE NAME ──`
- Enums (e.g. `ManagementModel`) are defined once in `components/schemas` and referenced via `$ref`

---

## Adding a New Module — Checklist

1. Create folder `src/modules/<name>/`
2. `entities/<name>.entity.ts` — TypeORM entity (add more entity files here for join tables / sub-entities)
3. `validators/<name>.validators.ts` — Zod schemas + Validator types
4. `<name>.enum.ts` — (optional) Domain enums for fixed classifications
5. `<name>.interface.ts` — repository interface
6. `<name>.repository.ts` — implements interface
7. `<name>.service.ts` — business logic, uses interface; inject `DataSource` if transactions needed
8. `serializers/<name>.serializer.ts` — `single()` + `collection()`
9. `<name>.controller.ts` — HTTP handlers
10. `<name>.module.ts` — `create<Name>Controller(dataSource)` factory
11. Register ALL new entities in `src/config/database.ts` → `entities: [Stock, NewEntity]`
12. Add routes to `src/routes/api.ts` **and** `tests/helpers/app.ts`
13. For file uploads: use `zValidator('form', ...)` instead of `'json'`
14. Write `tests/<name>.test.ts` — seed dependencies, test CRUD + error cases
15. Document all endpoints in `swagger.yml` — schema + inline example

# Stock Backend Service

REST API service untuk manajemen stok, dibangun dengan Bun + Hono + TypeORM (MySQL).

## Tech Stack

| Layer | Library |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Framework | [Hono](https://hono.dev) |
| ORM | [TypeORM](https://typeorm.io) + MySQL |
| Validation | [Zod](https://zod.dev) + @hono/zod-validator |
| File Storage | [MinIO](https://min.io) |
| Language | TypeScript |

---

## Getting Started

### Local (tanpa Docker)

```bash
# Install dependencies
bun install

# Copy env
cp .env.example .env
# Edit .env sesuai kebutuhan

# Run dev server (hot reload)
bun run dev
```

Server berjalan di `http://localhost:3000`

### Docker Compose

```bash
cp .env.example .env
# Edit .env sesuai kebutuhan

docker compose up -d --build
```

| Service | URL |
|---|---|
| API | http://localhost:3000 |
| MinIO Console | http://localhost:9001 |
| Swagger Docs | http://localhost:3000/docs |

---

## Environment Variables

Salin `.env.example` ke `.env` dan sesuaikan:

```env
PORT=3000
NODE_ENV=production

# MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=secret
DB_NAME=be_stock
DB_SYNC=false        # set true hanya untuk development (auto-migrate)

# MinIO
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=stock-app
```

---

## Project Structure

```
src/
├── index.ts                    # Entry point — CORS, DB, MinIO init, error handler
├── config/
│   ├── config.ts               # Centralized env config
│   ├── database.ts             # TypeORM DataSource
│   └── minio.ts                # MinIO client + bucket auto-create
├── core/
│   ├── exceptions/base.ts      # BaseException + HTTP exception classes
│   ├── helpers/
│   │   ├── response.ts         # ApiResponse formatter
│   │   ├── validator.ts        # validationHook for zValidator
│   │   └── minio.ts            # MinioHelper static class
│   └── validators/
│       └── pagination.schema.ts
├── routes/api.ts               # Semua route (mounted di /api)
└── modules/
    ├── unit/
    ├── conversion/
    ├── stock/
    ├── stock-variant/
    └── additional/             # Read-only helper (dropdown/search)
```

---

## API Endpoints

Base URL: `/api`  
Docs: `GET /docs` (Swagger UI)

### Unit

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/unit` | List unit (paginasi) |
| GET | `/api/unit/:id` | Detail unit |
| POST | `/api/unit` | Buat unit baru (auto-create base conversion) |

### Conversion

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/conversion` | List konversi (paginasi) |
| GET | `/api/conversion/:id` | Detail konversi |
| POST | `/api/conversion` | Buat konversi baru |

### Stock

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/stock` | List stok (paginasi) |
| GET | `/api/stock/:id` | Detail stok |
| POST | `/api/stock` | Buat stok baru (`multipart/form-data`) |

### Stock Variant

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/stock-variant` | List semua variant (paginasi) |
| GET | `/api/stock-variant/:id` | Detail variant |
| GET | `/api/stock/:stockId/stock-variant` | List variant per stok |
| POST | `/api/stock-variant` | Buat variant baru |

### Additional (Helper/Dropdown)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/additional/conversion` | Semua konversi (tanpa paginasi) |
| GET | `/api/additional/base-conversion` | Hanya base conversion |

---

## Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": {},
  "meta": {
    "total": 0,
    "perPage": 10,
    "currentPage": 1,
    "lastPage": 1,
    "from": 1,
    "to": 0
  }
}
```

---

## Module Structure

Setiap domain module mengikuti urutan layer ini:

```
modules/<name>/
├── entities/<name>.entity.ts
├── validators/<name>.validators.ts
├── <name>.enum.ts              # (opsional)
├── <name>.interface.ts
├── <name>.repository.ts
├── <name>.service.ts
├── serializers/<name>.serializer.ts
├── <name>.controller.ts
└── <name>.module.ts            # Factory: createXxxController(dataSource)
```

Urutan penambahan module baru:

1. Entity → 2. Validators → 3. Interface → 4. Repository → 5. Service → 6. Serializer → 7. Controller → 8. Module
9. Daftarkan entity di `src/config/database.ts`
10. Tambahkan routes di `src/routes/api.ts`

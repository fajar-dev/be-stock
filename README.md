# Stock Backend Service

REST API service untuk manajemen stok, dibangun dengan Bun + Hono + TypeORM (MySQL).

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **ORM**: TypeORM + MySQL
- **Validation**: Zod + @hono/zod-validator
- **Language**: TypeScript
- **File Storage**: MinIO

## Pattern

1. Modular Pattern
   1.1. Entity
   1.2. Validators
   1.3. Interface
   1.4. Repository
   1.5. Service
   1.6. Serializer
   1.7. Controller
   1.8. Module
2. Dependency Injection
   2.1. Service depends on repository
   2.2. Controller depends on service
   2.3. Controller depends on validator
   2.4. Controller depends on serializer
   2.5. Repository depends on entity
3. Layered Architecture
   3.1. Controller Layer
   3.2. Service Layer
   3.3. Repository Layer
   3.4. Entity Layer
   3.5. Validator Layer
   3.6. Serializer Layer
   3.7. Interface Layer
4. Clean Code
   4.1. Single Responsibility
   4.2. Don't Repeat Yourself
   4.3. Keep It Simple Stupid
   4.4. You Ain't Gonna Need This
   4.5. Encapsulation
   4.6. Abstraction
   4.7. Polymorphism
   4.8. Inheritance

## Getting Started

```bash
# Install dependencies
bun install

# Copy env
cp .env.dist .env

# Run dev server
bun run dev
```

Server berjalan di `http://localhost:4000`

## Project Structure

```
src/
├── index.ts              # Entry point
├── config/               # Env config & database setup
├── core/                 # Shared exceptions, helpers, validators
├── routes/               # Route declarations (mounted at /api)
└── modules/<name>/       # Domain modules
    ├── entities/
    ├── validators/
    └── serializers/
```

## API Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": {},
  "meta": { "total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1 }
}
```

## Adding a New Module

Ikuti urutan ini:

1. Entity → 2. Validators → 3. Interface → 4. Repository → 5. Service → 6. Serializer → 7. Controller → 8. Module
2. Daftarkan entity di `config/database.ts`
3. Tambahkan route di `routes/api.ts`

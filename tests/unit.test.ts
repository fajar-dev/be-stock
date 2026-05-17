import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { createTestDataSource, createTestApp, get, post } from './helpers/app'

const dataSource = createTestDataSource()
const app = createTestApp(dataSource)
const uid = Date.now()

let unitId: number

beforeAll(async () => { await dataSource.initialize() })
afterAll(async () => { await dataSource.destroy() })

describe('Unit', () => {
    test('POST /unit — create', async () => {
        const res = await post(app, '/unit', { name: `Unit-${uid}`, isActive: true })
        const json = await res.json() as any
        expect(res.status).toBe(201)
        expect(json.success).toBe(true)
        expect(json.data.name).toBe(`Unit-${uid}`)
        unitId = json.data.id
    })

    test('GET /unit — list', async () => {
        const res = await get(app, '/unit?page=1&limit=10')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(Array.isArray(json.data)).toBe(true)
        expect(json.meta.total).toBeGreaterThan(0)
    })

    test('GET /unit/:id — detail', async () => {
        const res = await get(app, `/unit/${unitId}`)
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.id).toBe(unitId)
        expect(json.data.name).toBe(`Unit-${uid}`)
    })

    test('GET /unit/:id — 404 not found', async () => {
        const res = await get(app, '/unit/999999')
        expect(res.status).toBe(404)
    })

    test('POST /unit — 422 missing name', async () => {
        const res = await post(app, '/unit', { isActive: true })
        expect(res.status).toBe(422)
    })
})

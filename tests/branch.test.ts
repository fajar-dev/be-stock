import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { createTestDataSource, createTestApp, get, post } from './helpers/app'

const dataSource = createTestDataSource()
const app = createTestApp(dataSource)
const uid = Date.now()

let branchId: number

beforeAll(async () => { await dataSource.initialize() })
afterAll(async () => { await dataSource.destroy() })

describe('Branch', () => {
    test('POST /branch — create', async () => {
        const res = await post(app, '/branch', { code: `BR-${uid}`, name: `Branch-${uid}` })
        const json = await res.json() as any
        expect(res.status).toBe(201)
        expect(json.success).toBe(true)
        expect(json.data.code).toBe(`BR-${uid}`)
        branchId = json.data.id
    })

    test('POST /branch — 409 duplicate code', async () => {
        const res = await post(app, '/branch', { code: `BR-${uid}`, name: 'Duplicate' })
        expect(res.status).toBe(409)
    })

    test('GET /branch — list', async () => {
        const res = await get(app, '/branch?page=1&limit=10')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(Array.isArray(json.data)).toBe(true)
        expect(json.meta.total).toBeGreaterThan(0)
    })

    test('GET /branch/:id — detail', async () => {
        const res = await get(app, `/branch/${branchId}`)
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.id).toBe(branchId)
    })

    test('GET /branch/:id — 404 not found', async () => {
        const res = await get(app, '/branch/999999')
        expect(res.status).toBe(404)
    })

    test('POST /branch — 422 missing fields', async () => {
        const res = await post(app, '/branch', { name: 'No Code' })
        expect(res.status).toBe(422)
    })
})

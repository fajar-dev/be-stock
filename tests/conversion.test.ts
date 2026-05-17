import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { createTestDataSource, createTestApp, get, post } from './helpers/app'

const dataSource = createTestDataSource()
const app = createTestApp(dataSource)
const uid = Date.now()

let unitId: number
let conversionId: number

beforeAll(async () => {
    await dataSource.initialize()
    // create a unit to use as base for conversions
    const res = await post(app, '/unit', { name: `ConvUnit-${uid}`, isActive: true })
    const json = await res.json() as any
    unitId = json.data.id
})
afterAll(async () => { await dataSource.destroy() })

describe('Conversion', () => {
    test('POST /conversion — create', async () => {
        const res = await post(app, '/conversion', {
            name: `Conv-${uid}`,
            unitBasicId: unitId,
            unitConversionId: unitId,
            value: 100,
        })
        const json = await res.json() as any
        expect(res.status).toBe(201)
        expect(json.success).toBe(true)
        expect(json.data.name).toBe(`Conv-${uid}`)
        conversionId = json.data.id
    })

    test('GET /conversion — list', async () => {
        const res = await get(app, '/conversion?page=1&limit=10')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(Array.isArray(json.data)).toBe(true)
        expect(json.meta.total).toBeGreaterThan(0)
    })

    test('GET /conversion/:id — detail', async () => {
        const res = await get(app, `/conversion/${conversionId}`)
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.id).toBe(conversionId)
        expect(Number(json.data.value)).toBe(100)
    })

    test('GET /conversion/:id — 404 not found', async () => {
        const res = await get(app, '/conversion/999999')
        expect(res.status).toBe(404)
    })

    test('POST /conversion — 422 missing unitBasicId', async () => {
        const res = await post(app, '/conversion', { name: 'Bad', value: 1 })
        expect(res.status).toBe(422)
    })
})

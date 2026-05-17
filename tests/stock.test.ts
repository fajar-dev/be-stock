import { describe, test, expect, beforeAll, afterAll, jest } from 'bun:test'
import { createTestDataSource, createTestApp, get, post } from './helpers/app'
import { MinioHelper } from '../src/core/helpers/minio'

jest.spyOn(MinioHelper, 'getPresignedUrl').mockResolvedValue('http://mock-minio/photo.jpg')

const dataSource = createTestDataSource()
const app = createTestApp(dataSource)
const uid = Date.now()

let baseConversionId: number
let stockId: number

beforeAll(async () => {
    await dataSource.initialize()

    const unitRes = await post(app, '/unit', { name: `StockUnit-${uid}`, isActive: true })
    const unitJson = await unitRes.json() as any
    const unitId = unitJson.data.id

    // base conversion is auto-created with unit (value=1, same unit), fetch it
    const convRes = await get(app, `/additional/base-conversion?q=StockUnit-${uid}`)
    const convJson = await convRes.json() as any
    baseConversionId = convJson.data[0].id
})
afterAll(async () => { await dataSource.destroy() })

describe('Stock', () => {
    test('POST /stock — create', async () => {
        const res = await post(app, '/stock', {
            code: `STK-${uid}`,
            name: `Stock-${uid}`,
            managementModel: 'LOT',
            baseConversionId,
            itemType: 'Peralatan',
            toolType: 'Kabel Lan',
            category: 'Aset',
        })
        const json = await res.json() as any
        expect(res.status).toBe(201)
        expect(json.success).toBe(true)
        expect(json.data.code).toBe(`STK-${uid}`)
        stockId = json.data.id
    })

    test('POST /stock — 409 duplicate code', async () => {
        const res = await post(app, '/stock', {
            code: `STK-${uid}`,
            name: 'Duplicate',
            managementModel: 'LOT',
            baseConversionId,
            itemType: 'Peralatan',
            toolType: 'Kabel Lan',
            category: 'Aset',
        })
        expect(res.status).toBe(409)
    })

    test('POST /stock — 400 invalid baseConversionId', async () => {
        const res = await post(app, '/stock', {
            code: `STK-BAD-${uid}`,
            name: 'Bad Stock',
            managementModel: 'LOT',
            baseConversionId: 999999,
            itemType: 'Peralatan',
            toolType: 'Kabel Lan',
            category: 'Aset',
        })
        expect(res.status).toBe(400)
    })

    test('GET /stock — list', async () => {
        const res = await get(app, '/stock?page=1&limit=10')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(Array.isArray(json.data)).toBe(true)
        expect(json.meta.total).toBeGreaterThan(0)
    })

    test('GET /stock — list with search', async () => {
        const res = await get(app, `/stock?page=1&limit=10&q=Stock-${uid}`)
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.length).toBeGreaterThan(0)
    })

    test('GET /stock/:id — detail', async () => {
        const res = await get(app, `/stock/${stockId}`)
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.id).toBe(stockId)
        expect(json.data.managementModel).toBe('LOT')
    })

    test('GET /stock/:id — 404 not found', async () => {
        const res = await get(app, '/stock/999999')
        expect(res.status).toBe(404)
    })

    test('POST /stock — 422 missing required fields', async () => {
        const res = await post(app, '/stock', { name: 'Incomplete' })
        expect(res.status).toBe(422)
    })
})

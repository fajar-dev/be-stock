import { describe, test, expect, beforeAll, afterAll, jest } from 'bun:test'
import { createTestDataSource, createTestApp, get, post } from './helpers/app'
import { MinioHelper } from '../src/core/helpers/minio'

jest.spyOn(MinioHelper, 'getPresignedUrl').mockResolvedValue('http://mock-minio/photo.jpg')

const dataSource = createTestDataSource()
const app = createTestApp(dataSource)
const uid = Date.now()

let stockId: number
let branchId: number
let variantId: number

beforeAll(async () => {
    await dataSource.initialize()

    // unit (auto-creates base conversion)
    const unitRes = await post(app, '/unit', { name: `VarUnit-${uid}`, isActive: true })
    const unitJson = await unitRes.json() as any
    const unitId = unitJson.data.id

    // base conversion
    const convRes = await get(app, `/additional/base-conversion?q=VarUnit-${uid}`)
    const convJson = await convRes.json() as any
    const baseConversionId = convJson.data[0].id

    // branch
    const branchRes = await post(app, '/branch', { code: `VBR-${uid}`, name: `VBranch-${uid}` })
    const branchJson = await branchRes.json() as any
    branchId = branchJson.data.id

    // stock
    const stockRes = await post(app, '/stock', {
        code: `VSTK-${uid}`,
        name: `VStock-${uid}`,
        managementModel: 'LOT',
        baseConversionId,
        itemType: 'Peralatan',
        toolType: 'Kabel Lan',
        category: 'Aset',
    })
    const stockJson = await stockRes.json() as any
    stockId = stockJson.data.id
})
afterAll(async () => { await dataSource.destroy() })

describe('StockVariant', () => {
    test('POST /stock-variant — create bulk', async () => {
        const res = await post(app, '/stock-variant', {
            stockId,
            variant: [
                { code: `VAR-A-${uid}`, name: `Variant A-${uid}`, branchId },
                { code: `VAR-B-${uid}`, name: `Variant B-${uid}`, branchId, description: 'desc' },
            ],
        })
        const json = await res.json() as any
        expect(res.status).toBe(201)
        expect(json.success).toBe(true)
        expect(json.data.length).toBe(2)
        variantId = json.data[0].id
    })

    test('POST /stock-variant — 409 same variant same branch', async () => {
        const res = await post(app, '/stock-variant', {
            stockId,
            variant: [{ code: `VAR-A-${uid}`, name: 'Dup', branchId }],
        })
        expect(res.status).toBe(409)
    })

    test('POST /stock-variant — 400 invalid stockId', async () => {
        const res = await post(app, '/stock-variant', {
            stockId: 999999,
            variant: [{ code: `VAR-X-${uid}`, name: 'X', branchId }],
        })
        expect(res.status).toBe(400)
    })

    test('GET /stock-variant — list', async () => {
        const res = await get(app, '/stock-variant?page=1&limit=10')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(Array.isArray(json.data)).toBe(true)
    })

    test('GET /stock/:stockId/stock-variant — by stock', async () => {
        const res = await get(app, `/stock/${stockId}/stock-variant?page=1&limit=10`)
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.length).toBeGreaterThan(0)
    })

    test('GET /stock-variant/:id — detail', async () => {
        const res = await get(app, `/stock-variant/${variantId}`)
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.id).toBe(variantId)
    })

    test('GET /stock-variant/:id — 404 not found', async () => {
        const res = await get(app, '/stock-variant/999999')
        expect(res.status).toBe(404)
    })

    test('POST /stock-variant — 422 empty variant array', async () => {
        const res = await post(app, '/stock-variant', { stockId, variant: [] })
        expect(res.status).toBe(422)
    })
})

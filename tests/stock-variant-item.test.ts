import { describe, test, expect, beforeAll, afterAll, jest } from 'bun:test'
import { createTestDataSource, createTestApp, get, post } from './helpers/app'
import { MinioHelper } from '../src/core/helpers/minio'

jest.spyOn(MinioHelper, 'getPresignedUrl').mockResolvedValue('http://mock-minio/photo.jpg')

const dataSource = createTestDataSource()
const app = createTestApp(dataSource)
const uid = Date.now()

let lotVariantId: number
let snVariantId: number
let itemId: number

beforeAll(async () => {
    await dataSource.initialize()

    const unitRes = await post(app, '/unit', { name: `ItemUnit-${uid}`, isActive: true })
    const unitId = (await unitRes.json() as any).data.id

    const convRes = await get(app, `/additional/base-conversion?q=ItemUnit-${uid}`)
    const baseConversionId = (await convRes.json() as any).data[0].id

    const branchRes = await post(app, '/branch', { code: `IBR-${uid}`, name: `IBranch-${uid}` })
    const branchId = (await branchRes.json() as any).data.id

    // LOT stock
    const lotStockRes = await post(app, '/stock', {
        code: `ILOT-${uid}`, name: `LotStock-${uid}`,
        managementModel: 'LOT', baseConversionId,
        itemType: 'Peralatan', toolType: 'Kabel Lan', category: 'Aset',
    })
    const lotStockId = (await lotStockRes.json() as any).data.id

    const lotVarRes = await post(app, '/stock-variant', {
        stockId: lotStockId,
        variant: [{ code: `LVAR-${uid}`, name: `LotVar-${uid}`, branchId }],
    })
    lotVariantId = (await lotVarRes.json() as any).data[0].id

    // SERIAL_NUMBER stock
    const snStockRes = await post(app, '/stock', {
        code: `ISN-${uid}`, name: `SnStock-${uid}`,
        managementModel: 'SERIAL_NUMBER', baseConversionId,
        itemType: 'Peralatan', toolType: 'Kabel Lan', category: 'Aset',
    })
    const snStockId = (await snStockRes.json() as any).data.id

    const snVarRes = await post(app, '/stock-variant', {
        stockId: snStockId,
        variant: [{ code: `SNVAR-${uid}`, name: `SnVar-${uid}`, branchId }],
    })
    snVariantId = (await snVarRes.json() as any).data[0].id
})
afterAll(async () => { await dataSource.destroy() })

describe('StockVariantItem', () => {
    test('POST /stock-variant-item — create LOT items', async () => {
        const res = await post(app, '/stock-variant-item', {
            stockVariantId: lotVariantId,
            item: [
                { lot: `LOT-A-${uid}`, quantity: 50 },
                { lot: `LOT-B-${uid}`, quantity: 30 },
            ],
        })
        const json = await res.json() as any
        expect(res.status).toBe(201)
        expect(json.data.length).toBe(2)
        itemId = json.data[0].id
    })

    test('POST /stock-variant-item — create SERIAL_NUMBER items', async () => {
        const res = await post(app, '/stock-variant-item', {
            stockVariantId: snVariantId,
            item: [
                { serialNumber: `SN-001-${uid}` },
                { serialNumber: `SN-002-${uid}` },
            ],
        })
        const json = await res.json() as any
        expect(res.status).toBe(201)
        expect(json.data.length).toBe(2)
        expect(json.data[0].quantity).toBe(1)
    })

    test('POST /stock-variant-item — 400 LOT missing lot field', async () => {
        const res = await post(app, '/stock-variant-item', {
            stockVariantId: lotVariantId,
            item: [{ quantity: 10 }],
        })
        expect(res.status).toBe(400)
    })

    test('POST /stock-variant-item — 404 invalid variantId', async () => {
        const res = await post(app, '/stock-variant-item', {
            stockVariantId: 999999,
            item: [{ lot: 'X', quantity: 1 }],
        })
        expect(res.status).toBe(404)
    })

    test('GET /stock-variant-item — list', async () => {
        const res = await get(app, '/stock-variant-item?page=1&limit=10')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(Array.isArray(json.data)).toBe(true)
    })

    test('GET /stock-variant/:variantId/stock-variant-item — by variant', async () => {
        const res = await get(app, `/stock-variant/${lotVariantId}/stock-variant-item?page=1&limit=10`)
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.length).toBeGreaterThan(0)
    })

    test('GET /stock-variant-item/:id — detail', async () => {
        const res = await get(app, `/stock-variant-item/${itemId}`)
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.id).toBe(itemId)
    })

    test('GET /stock-variant-item/:id — 404 not found', async () => {
        const res = await get(app, '/stock-variant-item/999999')
        expect(res.status).toBe(404)
    })
})

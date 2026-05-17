import { describe, test, expect, beforeAll, afterAll, jest } from 'bun:test'
import { createTestDataSource, createTestApp, get, post } from './helpers/app'
import { MinioHelper } from '../src/core/helpers/minio'

jest.spyOn(MinioHelper, 'getPresignedUrl').mockResolvedValue('http://mock-minio/photo.jpg')

const dataSource = createTestDataSource()
const app = createTestApp(dataSource)
const uid = Date.now()

let variantCode: string

beforeAll(async () => {
    await dataSource.initialize()

    // unit + base conversion
    await post(app, '/unit', { name: `AddUnit-${uid}`, isActive: true })
    const convRes = await get(app, `/additional/base-conversion?q=AddUnit-${uid}`)
    const convJson = await convRes.json() as any
    const baseConversionId = convJson.data[0].id

    // branch
    const branchRes = await post(app, '/branch', { code: `ABRS-${uid}`, name: `AddBranch-${uid}` })
    const branchJson = await branchRes.json() as any
    const branchId = branchJson.data.id

    // stock
    const stockRes = await post(app, '/stock', {
        code: `ASTK-${uid}`,
        name: `AddStock-${uid}`,
        managementModel: 'UNIK',
        baseConversionId,
        itemType: 'Peralatan',
        toolType: 'Kabel Lan',
        category: 'Aset',
    })
    const stockJson = await stockRes.json() as any
    const stockId = stockJson.data.id

    // stock variant
    variantCode = `AVAR-${uid}`
    await post(app, '/stock-variant', {
        stockId,
        variant: [{ code: variantCode, name: `AddVariant-${uid}`, branchId }],
    })
})
afterAll(async () => { await dataSource.destroy() })

describe('Additional', () => {
    test('GET /additional/base-conversion — returns list', async () => {
        const res = await get(app, '/additional/base-conversion')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(Array.isArray(json.data)).toBe(true)
        expect(json.data.length).toBeGreaterThan(0)
    })

    test('GET /additional/base-conversion — search by name', async () => {
        const res = await get(app, `/additional/base-conversion?q=AddUnit-${uid}`)
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.length).toBeGreaterThan(0)
        expect(json.data[0].name).toContain(`AddUnit-${uid}`)
    })

    test('GET /additional/conversion — returns list', async () => {
        const res = await get(app, '/additional/conversion')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(Array.isArray(json.data)).toBe(true)
    })

    test('GET /additional/branch — returns list', async () => {
        const res = await get(app, '/additional/branch')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(Array.isArray(json.data)).toBe(true)
        expect(json.data.length).toBeGreaterThan(0)
    })

    test('GET /additional/branch — search by name', async () => {
        const res = await get(app, `/additional/branch?q=AddBranch-${uid}`)
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.length).toBeGreaterThan(0)
    })

    test('GET /additional/variant — returns list', async () => {
        const res = await get(app, '/additional/variant')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(Array.isArray(json.data)).toBe(true)
        expect(json.data.length).toBeGreaterThan(0)
    })

    test('GET /additional/variant — search by code', async () => {
        const res = await get(app, `/additional/variant?q=${variantCode}`)
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.length).toBeGreaterThan(0)
        const item = json.data[0]
        expect(item.code).toBe(variantCode)
        expect(Array.isArray(item.conversion)).toBe(true)
        expect(item.conversion.length).toBeGreaterThan(0)
        expect(item.stock).not.toBeNull()
        expect(item.stock.managementModel).toBe('UNIK')
    })
})

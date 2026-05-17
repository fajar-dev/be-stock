import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { createTestDataSource, createTestApp, get, post } from './helpers/app'

const dataSource = createTestDataSource()
const app = createTestApp(dataSource)
const uid = Date.now()

beforeAll(async () => {
    await dataSource.initialize()

    // seed unit + base conversion
    await post(app, '/unit', { name: `AddUnit-${uid}`, isActive: true })

    // seed branch
    await post(app, '/branch', { code: `ABRS-${uid}`, name: `AddBranch-${uid}` })
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
})

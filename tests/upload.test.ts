import { describe, test, expect, beforeAll, afterAll, jest } from 'bun:test'
import { createTestDataSource, createTestApp, get } from './helpers/app'
import { MinioHelper } from '../src/core/helpers/minio'

jest.spyOn(MinioHelper, 'getPresignedPutUrl').mockResolvedValue('http://mock-minio/presigned-put-url')

const dataSource = createTestDataSource()
const app = createTestApp(dataSource)

beforeAll(async () => { await dataSource.initialize() })
afterAll(async () => { await dataSource.destroy() })

describe('Upload', () => {
    test('GET /upload/presigned — stocks folder', async () => {
        const res = await get(app, '/upload/presigned?folder=stocks&ext=jpg')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.success).toBe(true)
        expect(json.data.uploadUrl).toBe('http://mock-minio/presigned-put-url')
        expect(json.data.objectName).toMatch(/^stocks\/\d+-\d+\.jpg$/)
    })

    test('GET /upload/presigned — stock-variants folder', async () => {
        const res = await get(app, '/upload/presigned?folder=stock-variants&ext=png')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.objectName).toMatch(/^stock-variants\/\d+-\d+\.png$/)
    })

    test('GET /upload/presigned — 400 invalid folder', async () => {
        const res = await get(app, '/upload/presigned?folder=invalid')
        expect(res.status).toBe(400)
    })

    test('GET /upload/presigned — 400 missing folder', async () => {
        const res = await get(app, '/upload/presigned')
        expect(res.status).toBe(400)
    })

    test('GET /upload/presigned — default ext jpg', async () => {
        const res = await get(app, '/upload/presigned?folder=stocks')
        const json = await res.json() as any
        expect(res.status).toBe(200)
        expect(json.data.objectName).toMatch(/\.jpg$/)
    })
})

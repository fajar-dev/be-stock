import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { AppDataSource } from './config/database'
import { BaseException } from './core/exceptions/base'
import { ApiResponse } from './core/helpers/response'
import { config } from './config/config'
import api from './routes/api'
import { initializeMinio } from './config/minio'

const app = new Hono()

// CORS
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))


// Database Connection
try {
    await AppDataSource.initialize()
    console.log("Database connected successfully")
    await initializeMinio()
    console.log("Minio initialized successfully")
} catch (err) {
    console.error("Initialization error", err)
    process.exit(1)
}

// Application Routes
app.route('/api', api)

// Global Error Handler
app.onError((err, c) => {
    if (err instanceof BaseException) {
        console.error(`[Exception] ${err.status} - ${err.message}`)
        return ApiResponse.error(c, err.message, err.status, err.context)
    }

    console.error("error: ", err.message)

    const errors = config.app.env !== "production" ? { 
        message: err.message, 
        stack: err.stack 
    } : null

    return ApiResponse.error(c, "Internal Server Error", 500, errors)
})

export default {
  port: config.app.port,
  fetch: app.fetch,
};
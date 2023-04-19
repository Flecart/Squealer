import express from 'express'
import bodyParser from 'body-parser'
import next from 'next'
import { handler } from '../build/svelte/handler.js'
import endpoint from '../config/endpoints.js'

const app = next(
    { 
        dev: process.env.NODE_ENV !== 'production',
        dir: "app"
    }
)

const handleNext = app.getRequestHandler()

app.prepare()
    .then(() => {
        const server = express()
        server.use(bodyParser.json())
        server.use(bodyParser.urlencoded({ extended: true }))

        console.log(endpoint.DASHBOARD);
        server.use(`/${endpoint.SMM}/`, express.static("smm/"));
        server.use(`/${endpoint.DASHBOARD}/`, handler);
        server.all('*', handleNext)

        server.listen(3000, (err) => {
            if (err) throw err
            console.log('> Ready on http://localhost:3000')
        })
    })
    .catch((ex) => {
        console.error(ex.stack)
        process.exit(1)
})
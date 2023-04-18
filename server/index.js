import express from 'express'
import bodyParser from 'body-parser'
import next from 'next'
import {handler} from '../build/svelte/handler.js'

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

        server.get('/api/todolist', (req, res) => {
            return res.send({ list: []})
        })

        server.use("/smm/", express.static("smm/"));
        server.use('/svelte/', handler);
        server.all('*', (req, res) => {
            return handleNext(req, res)
        })

        server.listen(3000, (err) => {
            if (err) throw err
            console.log('> Ready on http://localhost:3000')
        })
    })
    .catch((ex) => {
        console.error(ex.stack)
        process.exit(1)
    })
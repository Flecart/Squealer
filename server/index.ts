import express from 'express';
import bodyParser from 'body-parser';
import endpoint from '../config/endpoints.json' assert { type: "json" };
import path from 'path';
import { fileURLToPath } from 'url';
import controllers from '../api/api.js';

import { attachControllers } from '@decorators/express';

// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-js-when-using-es6-modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))


const apiRouter = express.Router();
attachControllers(apiRouter, controllers);

server.use('/api', apiRouter);

server.use(`/${endpoint.SMM}`, express.static(endpoint.SMM));

server.use(express.static(path.resolve(__dirname, '../app'))); 

server.use(`/${endpoint.DASHBOARD}`,express.static(path.resolve(__dirname, '../', endpoint.DASHBOARD))); 

server.all(`/${endpoint.DASHBOARD}`, (_, res) => {
    res.sendFile(path.resolve(__dirname, '../', endpoint.DASHBOARD, 'index.html'));
});

server.all('*', (_, res) => {
    res.sendFile(path.resolve(__dirname, '../app', 'index.html'));
});

server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000')
})
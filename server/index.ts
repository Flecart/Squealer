import express from 'express';
import bodyParser from 'body-parser';
import endpoint from '../config/endpoints.json';
import path from 'path';
import { RegisterRoutes } from "../build/api/routes";

import initMongo from './mongo';

// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-js-when-using-es6-modules

initMongo()
.then(() => {
    const server = express()
    server.use(bodyParser.json())
    server.use(bodyParser.urlencoded({ extended: true }))
    
    RegisterRoutes(server);
    
    server.use(`/${endpoint.SMM}`, express.static(endpoint.SMM));
    
    server.use(`/${endpoint.DASHBOARD}`, express.static(path.resolve(__dirname, '../', endpoint.DASHBOARD))); 
    server.all(`/${endpoint.DASHBOARD}`, (_, res) => {
        res.sendFile(path.resolve(__dirname, '../', endpoint.DASHBOARD, 'index.html'));
    });
    
    server.use(express.static(path.resolve(__dirname, '../app'))); 
    server.all('*', (_, res) => {
        res.sendFile(path.resolve(__dirname, '../app', 'index.html'));
    });
    
    server.listen(3000, () => {
        console.log('> Ready on http://localhost:3000')
    })
})

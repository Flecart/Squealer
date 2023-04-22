import express, { Response as ExResponse, Request as ExRequest } from 'express';
import bodyParser from 'body-parser';
import endpoint from '../config/endpoints.json';
import path from 'path';
import { RegisterRoutes } from "../build/api/routes";

import swaggerUi from "swagger-ui-express";
import initMongo from './mongo';

import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});


// utilizzato per compatibilità con i comandi di dev
const DEV_DIR = process.env['NODE_ENV'] === "development" ? 'build/' : '';

initMongo()
.then(() => {
    const server = express()
    server.use(bodyParser.json())
    server.use(bodyParser.urlencoded({ extended: true }))
    
    RegisterRoutes(server);
    server.use(`/${endpoint.APIDOCS}`, swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
        return res.send(
            swaggerUi.generateHTML(await import(`../${DEV_DIR}swagger.json`))
        );
    });
    
    server.use(`/${endpoint.SMM}`, express.static(endpoint.SMM));
    
    server.use(`/${endpoint.DASHBOARD}`, express.static(path.resolve(__dirname, '../', endpoint.DASHBOARD))); 
    server.all(`/${endpoint.DASHBOARD}`, (_req: ExRequest, res: ExResponse) => {
        res.sendFile(path.resolve(__dirname, `../${DEV_DIR}`, endpoint.DASHBOARD, 'index.html'));
    });
    
    server.use(express.static(path.resolve(__dirname, `../${DEV_DIR}app`))); 
    server.all('*', (_req: ExRequest, res: ExResponse) => {
        res.sendFile(path.resolve(__dirname, `../${DEV_DIR}app`, 'index.html'));
    });

    
    server.listen(3000, () => {
        console.log('> Ready on http://localhost:3000')
    })
})

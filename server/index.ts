import express, { Response as ExResponse, Request as ExRequest } from 'express';
import bodyParser from 'body-parser';
import endpoint from '../config/endpoints.json';
import path from 'path';
import { RegisterRoutes } from '../build/api/routes';
import { ENABLE_CROSS_ORIGIN, DEV_DIR, PORT } from '../config/config';
import cors from 'cors';

import swaggerUi from 'swagger-ui-express';
import initMongo from './mongo';
import { HttpError } from '@model/error';
import logger from './logger';
import { errors as joseErrors } from 'jose';
import collectEvents from './history';

const indexLogger = logger.child({ label: 'index' });

function errorHandler(err: Error, _req: ExRequest, res: ExResponse, _next: Function) {
    let httpError: HttpError;
    if (err instanceof HttpError) {
        httpError = err;
    } else if (err instanceof joseErrors.JWTExpired) {
        httpError = new HttpError(401, 'Token expired');
    } else {
        console.error('at errorHandler ', err);
        httpError = new HttpError(500, `Error: ${err.message}`);
    }

    res.status(httpError.status).send(
        JSON.stringify({
            status: httpError.status,
            message: httpError.message,
        }),
    );
}

function logMiddleware(req: ExRequest, _res: ExResponse, next: Function) {
    indexLogger.info(`[${req.method}] api request on ${req.url}`);
    next();
}

initMongo()
    .then(collectEvents)
    .then(() => {
        indexLogger.info('MongoDB and storage dir initialized');

        const server = express();
        server.disable('x-powered-by');

        if (ENABLE_CROSS_ORIGIN) {
            server.use(cors());
        }

        server.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        server.use(bodyParser.json({ limit: '50mb' }));

        server.use('/api/', logMiddleware);
        RegisterRoutes(server);
        server.use('/api/', errorHandler);

        server.use(`/${endpoint.APIDOCS}`, swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
            return res.send(swaggerUi.generateHTML(await import(`../${DEV_DIR}swagger.json`)));
        });

        server.use(`/${endpoint.DASHBOARD}`, express.static(endpoint.DASHBOARD));

        indexLogger.info(
            'smm path is ',
            path.resolve(__dirname, `../${DEV_DIR}`, endpoint.SMM, 'index.html'),
            'endpoint is: ',
            endpoint.SMM,
        );

        server.use(`/${endpoint.SMM}`, express.static(path.resolve(__dirname, '../', endpoint.SMM)));
        server.all(`/${endpoint.SMM}`, (_req: ExRequest, res: ExResponse) => {
            indexLogger.info(
                'serving smm path is ',
                path.resolve(__dirname, `../${DEV_DIR}`, endpoint.SMM, 'index.html'),
            );
            res.sendFile(path.resolve(__dirname, `../${DEV_DIR}`, endpoint.SMM, 'index.html'));
        });

        server.use(express.static(path.resolve(__dirname, `../${DEV_DIR}app`)));
        server.all('*', (_req: ExRequest, res: ExResponse) => {
            res.sendFile(path.resolve(__dirname, `../${DEV_DIR}app`, 'index.html'));
        });

        server.listen(PORT, () => {
            indexLogger.info(`> Ready on http://localhost:${PORT}`);
        });
    });

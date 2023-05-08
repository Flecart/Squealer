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

// utilizzato per compatibilità con i comandi di dev

function errorHandler(err: Error, _req: ExRequest, res: ExResponse, _next: Function) {
    let httpError: HttpError;
    if (err instanceof HttpError) {
        httpError = err;
    } else {
        console.error(err);
        httpError = new HttpError(500, `Error: ${err.message}`);
    }

    res.status(httpError.status).send(
        JSON.stringify({
            status: httpError.status,
            message: httpError.message,
        }),
    );
}

initMongo().then(() => {
    const server = express();
    server.disable('x-powered-by');

    if (ENABLE_CROSS_ORIGIN) {
        server.use(cors());
    }

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    RegisterRoutes(server);
    server.use('/api/', errorHandler);

    server.use(`/${endpoint.APIDOCS}`, swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
        return res.send(swaggerUi.generateHTML(await import(`../${DEV_DIR}swagger.json`)));
    });

    server.use(`/${endpoint.DASHBOARD}`, express.static(endpoint.DASHBOARD));

    server.use(`/${endpoint.SMM}`, express.static(path.resolve(__dirname, '../', endpoint.SMM)));
    server.all(`/${endpoint.SMM}`, (_req: ExRequest, res: ExResponse) => {
        res.sendFile(path.resolve(__dirname, `../${DEV_DIR}`, endpoint.SMM, 'index.html'));
    });

    server.use(express.static(path.resolve(__dirname, `../${DEV_DIR}app`)));
    server.all('*', (_req: ExRequest, res: ExResponse) => {
        res.sendFile(path.resolve(__dirname, `../${DEV_DIR}app`, 'index.html'));
    });

    server.listen(PORT, () => {
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});

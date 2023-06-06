import { JWT_SECRET, JWT_ISSUER } from '@config/config';
import { HttpError } from '@model/error';
import * as express from 'express';
import * as jose from 'jose';
import logger from './logger';

const authLogger = logger.child({ label: 'auth' });

async function handleJWT(request: express.Request, rejectUnauthorized: boolean, _scopes?: string[]): Promise<any> {
    const tokenHeader = request.get('Authorization');
    const token = tokenHeader?.split(' ')[1]?.trim(); // format: "Bearer <token>"

    if (!token) {
        if (rejectUnauthorized) {
            authLogger.info('No token provided by user request, rejecting');
            return new HttpError(401, 'No token provided');
        } else return null;
    }

    const joseResponse = await jose.jwtVerify(token, JWT_SECRET, {
        // TODO: settare questi con issuer e audience corretta.
        // audience è tipo il dominio (o risorsa) che può accedere al token
        issuer: JWT_ISSUER,
        audience: 'urn:example:audience',
    });

    // @ts-ignore-line
    authLogger.info(`granting request to '${joseResponse.payload.username}' as role '${joseResponse.payload.role}'`);
    return joseResponse;
}

export function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
    switch (securityName) {
        case 'jwt':
            return handleJWT(request, true, scopes);
        case 'maybeJWT':
            return handleJWT(request, false, scopes);
    }

    return Promise.reject(new HttpError(404, `Security scheme ${securityName} is not supported`));
}

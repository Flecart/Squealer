import { JWT_SECRET, JWT_ISSUER } from '@config/config';
import { HttpError } from '@model/error';
import * as express from 'express';
import * as jose from 'jose';

function handleJWT(request: express.Request, rejectUnauthorized: boolean, _scopes?: string[]): Promise<any> {
    const tokenHeader = request.get('Authorization');
    const token = tokenHeader?.split(' ')[1]?.trim(); // format: "Bearer <token>"

    if (!token) {
        if (rejectUnauthorized) return Promise.reject(new HttpError(401, 'No token provided'));
        else return Promise.resolve(null);
    }

    return jose.jwtVerify(token, JWT_SECRET, {
        // TODO: settare questi con issuer e audience corretta.
        // audience è tipo il dominio (o risorsa) che può accedere al token
        issuer: JWT_ISSUER,
        audience: 'urn:example:audience',
    });
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

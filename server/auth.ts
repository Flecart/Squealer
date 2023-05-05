import { JWT_SECRET, JWT_ISSUER } from '@config/config';
import { HttpError } from '@model/error';
import * as express from 'express';
import * as jose from 'jose';

function handleJWT(request: express.Request, _scopes?: string[]): Promise<jose.JWTVerifyResult> {
    const tokenHeader = request.get('Authorization');
    const token = tokenHeader?.split(' ')[1]?.trim(); // format: "Bearer <token>"

    if (!token) {
        throw new HttpError(401, 'No token provided');
    }

    return jose.jwtVerify(token, JWT_SECRET, {
        // TODO: settare questi con issuer e audience corretta.
        // audience è tipo il dominio (o risorsa) che può accedere al token
        issuer: JWT_ISSUER,
        audience: 'urn:example:audience',
    });
}

export function expressAuthentication(
    request: express.Request,
    securityName: string,
    scopes?: string[],
): Promise<jose.JWTVerifyResult> {
    switch (securityName) {
        case 'jwt':
            return handleJWT(request, scopes);
    }

    return Promise.reject(new HttpError(404, `Security scheme ${securityName} is not supported`));
}

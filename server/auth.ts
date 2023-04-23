import { JWT_SECRET, JWT_ISSUER } from '../config/config';
import * as express from 'express';
import * as jose from 'jose';

function handleJWT(request: express.Request, _scopes?: string[]): Promise<any> {
    const token = request.body.token || request.headers['x-access-token'];

    return new Promise((resolve, reject) => {
        jose.jwtVerify(token, JWT_SECRET, {
            // TODO: settare questi con issuer e audience corretta.
            // audience è tipo il dominio (o risorsa) che può accedere al token
            issuer: JWT_ISSUER,
            audience: 'urn:example:audience',
        })
            .then((obj) => {
                console.log('JWT VALID ' + obj);
                resolve(obj);
            })
            .catch((e) => {
                reject(e);
            });
    });
}

export function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
    switch (securityName) {
        case 'jwt':
            return handleJWT(request, scopes);
        default:
            return Promise.reject({});
    }

    return Promise.reject({});
}

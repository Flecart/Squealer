import { JWT_SECRET, JWT_ISSUER } from '../config/config';
import * as express from 'express';
import * as jose from 'jose';

function handleJWT(request: express.Request, _scopes?: string[]): Promise<any> {
    try {
        const tokenHeader = request.get('Authorization');
        const token = tokenHeader?.split(' ')[1]; // format: "Bearer <token>"

        if (!token) {
            return Promise.reject({});
        }

        return new Promise((resolve, reject) => {
            jose.jwtVerify(token, JWT_SECRET, {
                // TODO: settare questi con issuer e audience corretta.
                // audience è tipo il dominio (o risorsa) che può accedere al token
                issuer: JWT_ISSUER,
                audience: 'urn:example:audience',
            })
                .then((obj) => {
                    resolve(obj);
                })
                .catch((_e) => {
                    // TODO: use the error
                    reject({});
                });
        });
    } catch (_e) {
        // TODO: use the error in loggin system
        return Promise.reject({});
    }
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

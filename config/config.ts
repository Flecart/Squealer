import dotenv from 'dotenv';

dotenv.config({
    path: './.env',
});

export const JWT_SECRET = new TextEncoder().encode(process.env['JWT_TOKEN'] || 'secret');
export const PASS_HASH = new TextEncoder().encode(process.env['PASS_HASH'] || 'secret');
export const JWT_ALG = process.env['JWT_ALG'] || 'HS256';
export const DEV_DIR = process.env['NODE_ENV'] === 'development' ? 'build/' : '';
export const MONGO_USER = process.env['MONGO_USER']; // TODO aggiungerci quelle di defualt della build del server
export const MONGO_PASS = process.env['MONGO_PASS'];
export const MONGO_DOMAIN = process.env['MONGO_DOMAIN'];
export const JWT_ISSUER = process.env['JWT_ISSUER'] || 'urn:squealer:issuer';
export const PORT = process.env['PORT'] || 3000;
export const CROSS_ORIGIN = process.env['CROSS_ORIGIN'] === 'true' || false;

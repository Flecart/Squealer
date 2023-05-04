import { describe, expect } from '@jest/globals';
import request from 'supertest';
import dotenv from 'dotenv';
import { baseUrl, apiUserCreate, apiUserLogin, apiUserGet, apiUserQuota } from '../utils';

dotenv.config({
    path: './.env',
});

let token: string;

beforeAll(async () => {
    const user = {
        username: 'test',
        password: 'test',
    };
    await request(baseUrl).post(apiUserCreate).send(user);

    request(baseUrl)
        .post(apiUserLogin)
        .send(user)
        .expect(200)
        .end((_, res) => {
            token = res.body.token.trim();
        });
});

describe('UserService', () => {
    it('should get current user', () => {
        request(baseUrl)
            .get(apiUserGet)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end((_, res) => {
                expect(res.body.username).toBe('test');
                expect(res.body.name).toBe('test');
            });
    });

    it('should user endpoint return error on no authorization header', async () => {
        await request(baseUrl).get(apiUserGet).expect(401);
    });

    it('should get current user quota', async () => {
        request(baseUrl)
            .get(apiUserQuota)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end((_, res) => {
                expect(res.body.day).toBe(0);
                expect(res.body.month).toBe(0);
                expect(res.body.year).toBe(0);
            });
    });

    it('should user quota endpoint return error on no authorization header', async () => {
        await request(baseUrl).get(apiUserQuota).expect(401);
    });
});

import { describe, expect } from '@jest/globals';
import request from 'supertest';
import dotenv from 'dotenv';
import { baseUrl, apiUserCreate, apiUserLogin, apiUserGet, apiUserQuota } from '../utils';
import UserService from './userService';

dotenv.config({
    path: './.env',
});

let token: string;

describe.skip('UserService api calls', () => {
    beforeAll(async () => {
        const user = {
            username: 'test',
            password: 'test',
        };
        await request(baseUrl).post(apiUserCreate).send(user);

        const res = await request(baseUrl).post(apiUserLogin).send(user).expect(200);

        token = res.body.token;
    });

    it('should be defined the user token', () => {
        expect(token).toBeDefined();
    });

    it('should get current user', async () => {
        const res = await request(baseUrl).get(apiUserGet).set('Authorization', `Bearer ${token}`).expect(200);

        expect(res.body.username).toBe('test');
        expect(res.body.name).toBe('test');
    });

    it('should user endpoint return error on no authorization header', async () => {
        await request(baseUrl).get(apiUserGet).expect(401);
    });

    it.skip('should get current user quota', async () => {
        const res = await request(baseUrl).get(apiUserQuota).set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.day).toBe(0);
        expect(res.body.month).toBe(0);
        expect(res.body.year).toBe(0);
    });

    it.skip('should user quota endpoint return error on no authorization header', async () => {
        await request(baseUrl).get(apiUserQuota).expect(401);
    });
});

describe.only('UserService', () => {
    it('should return user if found', async () => {
        // mock the db
        const mockUser = {
            username: 'test',
            password: 'test',
        };

        const mockDb = {
            findOne: jest.fn().mockResolvedValue(mockUser),
        };

        const userService = new UserService();
        const user = await userService.getUser('test', mockDb as any);
    });
});

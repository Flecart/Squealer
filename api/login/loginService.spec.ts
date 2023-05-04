import { describe, expect } from '@jest/globals';
import request from 'supertest';
import { Credentials } from './loginController';
import initMongo from '../../server/mongo';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({
    path: './.env',
});

const baseUrl = 'http://localhost:3000';

const apiUserCreate = '/api/auth/create';
const apiUserLogin = '/api/auth/login';

const dropDatabase = () => {
    initMongo().then(async () => {
        await mongoose.connection.db.dropDatabase(); // tanto nessuna informazione importante è presente, è sicuro droppare così
        mongoose.connection.close();
    });
};

beforeAll(dropDatabase);

describe('User Creation', () => {
    it('should create non existent user', async () => {
        await request(baseUrl)
            .post(apiUserCreate)
            .send({
                username: 'test',
                password: 'test',
            } as Credentials)
            .expect(201);
    });

    // TODO: fix this test later
    it.skip('should return different username on existent username', async () => {
        request(baseUrl)
            .post(apiUserCreate)
            .send({
                username: 'test',
                password: 'test',
            } as Credentials)
            .expect(201)
            .end((_, res) => {
                expect(res.body.username).toBe('test1');
            });
    });

    it('should return username and jwt', async () => {
        request(baseUrl)
            .post(apiUserCreate)
            .send({
                username: 'test-1',
                password: 'test',
            } as Credentials)
            .expect(201)
            .end((_, res) => {
                expect(res.body.username).toBe('test-1');
                expect(res.body.token).toBeDefined();
            });
    });
});

describe('User Login', () => {
    beforeAll(async () => {
        await request(baseUrl)
            .post(apiUserCreate)
            .send({
                username: 'test',
                password: 'test',
            } as Credentials);
    });

    it('login on correct username and password', async () => {
        await request(baseUrl)
            .post(apiUserLogin)
            .send({
                username: 'test',
                password: 'test',
            } as Credentials)
            .expect(200);
    });

    it('should return username and password on correct username and password', async () => {
        request(baseUrl)
            .post(apiUserLogin)
            .send({
                username: 'test',
                password: 'test',
            } as Credentials)
            .expect(200)
            .end((_, res) => {
                expect(res.body.username).toBe('test');
                expect(res.body.token).toBeDefined();
            });
    });

    it('should return error on incorrect password', async () => {
        await request(baseUrl)
            .post(apiUserLogin)
            .send({
                username: 'test',
                password: 'wrong',
            } as Credentials)
            .expect(401);
    });

    it('should return error on incorrect username', async () => {
        await request(baseUrl)
            .post(apiUserLogin)
            .send({
                username: 'i-am-non-existent-user-abcabc',
                password: 'test',
            } as Credentials)
            .expect(401);
    });
});

// TODO: fix this test
// describe("User Password Change", () => {
//     let token;
//     const apiUserChangePassword = "/api/auth/user/change-password"
//     const apiUserChangeUsername = "/api/auth/user/change-username"

//     beforeAll(async () => {
//         await request(baseUrl)
//         .post(apiUserCreate)
//         .send({
//             username: 'test',
//             password: 'test'
//         } as Credentials)
//         .end((_, res) => {
//             token = res.body.token
//         });
//     });

//     it('change username correctly if it doesnt exist', () => {
//         request(baseUrl)
//             .put(apiUserCreate)
//             .set('Authorization', `Bearer ${token}`)
//             .send({
//                 username: 'test-1',
//                 password: 'test'
//             } as Credentials)
//             .expect(200)
//     })
// });

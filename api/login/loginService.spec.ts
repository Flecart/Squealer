// @ts-nocheck

import { describe, expect } from '@jest/globals';
import request from 'supertest';
import { Credentials } from './loginController';
import initMongo from '../../server/mongo';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { baseUrl, apiUserCreate, apiUserLogin } from '../utils';

import { LoginService } from './loginService';
import AuthUserModel from '@db/auth';

describe('LoginService', () => {
    let loginService: LoginService;

    const authUserSaveMock = jest.fn();
    const userModelSaveMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        loginService = new LoginService();
    });
    describe('createUser', () => {
        const name = 'user1';
        const password = 'password1';
        const username = 'user1_1';
        const userModelId = 'userModelId1';
        const token = 'token1';

        beforeEach(() => {
            jest.resetAllMocks();
            (AuthUserModel.prototype.save as jest.Mock).mockImplementation(authUserSaveMock);
            (UserModel.prototype.save as jest.Mock).mockImplementation(userModelSaveMock);
        });

        it('should create user', async () => {
            (AuthUserModel.findOne as jest.Mock).mockResolvedValueOnce(null);
            (UserModel.findOne as jest.Mock).mockResolvedValueOnce(null);
            (loginService._createUserName as jest.Mock).mockResolvedValueOnce(username);
            (loginService._createDefaultUser as jest.Mock).mockReturnValueOnce({ _id: userModelId });
            (loginService._createDefaultUserAuth as jest.Mock).mockReturnValueOnce({});
            (loginService._createJWTSession as jest.Mock).mockResolvedValueOnce(token);
            const result = await loginService.createUser(name, password);

            expect(loginService._createUserName).toHaveBeenCalledWith(name);
            expect(loginService._createDefaultUser).toHaveBeenCalledWith(username, name);
            expect(UserModel.prototype.save).toHaveBeenCalled();
            expect(loginService._createDefaultUserAuth).toHaveBeenCalledWith(username, password, userModelId);
            expect(AuthUserModel.prototype.save).toHaveBeenCalled();
            expect(loginService._createJWTSession).toHaveBeenCalledWith(username);
            expect(result).toEqual({ username, token });
        });

        it('should throw HttpError if username already exists', async () => {
            (AuthUserModel.findOne as jest.Mock).mockResolvedValueOnce({});

            await expect(loginService.createUser(name, password)).rejects.toThrow(
                new HttpError(400, 'Username already exists'),
            );
        });
    });

    describe('changePassword', () => {
        const username = 'user1';
        const old_password = 'password1';
        const new_password = 'password2';
        const salt = 'salt1';
        const hashed_password = 'hashed_password1';

        beforeEach(() => {
            jest.resetAllMocks();
        });

        it('should change password', async () => {
            (AuthUserModel.findOne as jest.Mock).mockResolvedValueOnce({
                username,
                salt,
                password: hashed_password,
                save: authUserSaveMock,
            });
            const result = await loginService.changePassword(old_password, new_password, username);

            expect(AuthUserModel.findOne).toHaveBeenCalledWith({ username }, 'username salt password');
            expect(authUserSaveMock).toHaveBeenCalled();
            expect(result).toEqual({ message: 'Password changed' });
        });

        it('should throw HttpError if user not found', async () => {
            (AuthUserModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            await expect(loginService.changePassword(old_password, new_password, username)).rejects.toThrow(
                new HttpError(400, 'User not found'),
            );
        });

        it('should throw HttpError if old password is invalid', async () => {
            (AuthUserModel.findOne as jest.Mock).mockResolvedValueOnce({
                username,
                salt,
                password: 'invalid_password',
            });

            await expect(loginService.changePassword(old_password, new_password, username)).rejects.toThrow(
                new HttpError(400, 'Invalid password'),
            );
        });
    });

    describe('changeUsername', () => {
        const current_username = 'user1';
        const new_username = 'user2';

        beforeEach(() => {
            jest.resetAllMocks();
        });

        it('should change username', async () => {
            (AuthUserModel.findOne as jest.Mock).mockResolvedValueOnce({
                username: current_username,
                salt: 'salt1',
                password: 'password1',
                save: authUserSaveMock,
            });
            (UserModel.findOne as jest.Mock).mockResolvedValueOnce({
                username: current_username,
                save: userModelSaveMock,
            });
            const result = await loginService.changeUsername(new_username, current_username);

            expect(AuthUserModel.findOne).toHaveBeenCalledWith(
                { username: current_username },
                'username salt password',
            );
            expect(authUserSaveMock).toHaveBeenCalled();
            expect(UserModel.findOne).toHaveBeenCalledWith({ username: current_username }, 'username');
            expect(userModelSaveMock).toHaveBeenCalled();
            expect(result).toEqual({ message: 'Username changed' });
        });

        it('should throw HttpError if user not found', async () => {
            (AuthUserModel.findOne as jest.Mock).mockResolvedValueOnce(null);
            (UserModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            await expect(loginService.changeUsername(new_username, current_username)).rejects.toThrow(
                new HttpError(400, 'User not found'),
            );
        });
    });
});

describe.skip('User Login Old tests', () => {
    dotenv.config({
        path: './.env',
    });

    const dropDatabase = async () => {
        await initMongo();
        await mongoose.connection.db.dropDatabase(); // tanto nessuna informazione importante è presente, è sicuro droppare così
        await mongoose.connection.close();
    };

    beforeAll(async () => {
        await dropDatabase();
    });

    describe.skip('User Creation', () => {
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
            const res = await request(baseUrl)
                .post(apiUserCreate)
                .send({
                    username: 'test-1',
                    password: 'test',
                } as Credentials)
                .expect(201);
            expect(res.body.username).toBe('test-1');
            expect(res.body.token).toBeDefined();
        });
    });

    // old test with supertes
    describe.skip('User Login', () => {
        beforeAll(async () => {
            await request(baseUrl)
                .post(apiUserCreate)
                .send({
                    username: 'test',
                    password: 'test',
                } as Credentials)
                .expect(201);
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
            const res = await request(baseUrl)
                .post(apiUserLogin)
                .send({
                    username: 'test',
                    password: 'test',
                } as Credentials)
                .expect(200);
            expect(res.body.username).toBe('test');
            expect(res.body.token).toBeDefined();
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

import * as express from "express";
import * as jose from "jose";


const jwt_secrt=  new TextEncoder().encode(process.env["JWT_TOKEN"]|| 'secret');


function handleJWT(
    request: express.Request,
    _scopes?: string[]
): Promise<any>{
    const token =
        request.body.token ||
        request.headers["x-access-token"];
    return new Promise((resolve, reject) => {
        jose.jwtVerify(token,jwt_secrt ,{ }).then((obj)=>{
            console.log(obj);
            resolve(obj);
        }
        ).catch((err)=>{
            reject(err);
        });
    })
}

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
    switch (securityName){
        case 'jwt':
            return handleJWT(request,scopes);
    }
    return Promise.reject({});
}

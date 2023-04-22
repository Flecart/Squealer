import * as express from "express";
import * as jose from "jose";




function handleJWT(
  request: express.Request,
  scopes?: string[]
): Promise<any>{
    const token =
        request.body.token ||
        request.headers["x-access-token"];
    return new Promise((resolve, reject) => {
        
        jose.jwtVerify(token, new TextEncoder().encode(process.env["JWT_TOKEN"]), { }).then((obj)=>{
            console.log(obj);
            resolve(obj);
        }
        ).catch((err)=>{
            reject(err);
        });
    })
}

export function auth(
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

import {PORT} from "@config/config"

export const createUserRoute = "/api/auth/create"
export const loginRoute = "/api/auth/login"
export const channelCreateRoute = "/api/channel/create"
export const messageCreateRoute = "/api/message"
export const baseUrl = `http://localhost:${PORT}`
export const apiRoleRoute = "/api/user/role"


export type Credentials = {
    username: string
    password: string
}
import { PORT } from "@config/config"
import assert from 'node:assert'

export const baseUrl = `http://localhost:${PORT}`
export const createUserRoute = "/api/auth/create"
export const loginRoute = "/api/auth/login"
export const modifyUserRoleRoute = "/api/user/role"
export const apiRoleRoute = "/api/user/role"

export const addClientRoute = `/api/smm/add-client/{0}`
export const sendClientRequestRoute = `/api/smm/send-request/{0}`

export const channelCreateRoute = "/api/channel/create"
export const joinChannelRoute = `/api/channel/{0}/join`
export const addOwnerRoute = "/api/channel/{0}/add-owner"

export const temporizzatiRoute = "/api/temporizzati"
export const messageCreateRoute = "/api/message"
export const addReactionRoute = "/api/message/{0}/reaction"
export const geolocationRoute = "/api/message/geo/{0}"

export type Credentials = {
    username: string
    password: string
}

export function checkAndReportStatus(res: any, code: number, msg?: string) {
    if (res.status !== code) {
        console.log(res.text);
        console.log(res.body);
        assert(false, msg || `Expected status ${code}, got ${res.status}`);
    }
}

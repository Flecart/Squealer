import {PORT} from "@config/config"

export const baseUrl = `http://localhost:${PORT}`
export const createUserRoute = "/api/auth/create"
export const loginRoute = "/api/auth/login"
export const modifyUserRoleRoute = "/api/user/role"
export const apiRoleRoute = "/api/user/role"

export const addClientRoute = `/api/smm/add-client/{0}`

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
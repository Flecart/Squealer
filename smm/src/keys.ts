// Symbols are unique identifiers

import type { IUser } from '@model/user'
import type { Ref } from 'vue'

// see https://vuejs.org/guide/components/provide-inject.html#working-with-symbol-keys
export const authInject = Symbol('auth')
export const clientInject = Symbol('clients')
export const smmUserInject = Symbol('smmUser')

export const currentClientInject = Symbol('client')
export type currentClientType = {
    currentClient: Ref<IUser>
    setClient: (client: IUser) => void
}

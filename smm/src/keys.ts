// Symbols are unique identifiers

import type { IUser } from '@model/user'
import { inject, type Ref } from 'vue'

// see https://vuejs.org/guide/components/provide-inject.html#working-with-symbol-keys
export const authInject = Symbol('auth')
export const clientInject = Symbol('clients')
export const smmUserInject = Symbol('smmUser')

export const currentClientInject = Symbol('client')
export const sidebarShowInject = Symbol('sidebarShow')

export type currentClientType = {
  currentClient: Ref<IUser>
  setClient: (client: IUser) => void
}

export const injectAuth = () => {
  return inject<{ token: string; username: string }>(authInject)
}

export const injectClients = () => {
  return inject<IUser[]>(clientInject)
}

export const injectSmmUser = () => {
  return inject<IUser>(smmUserInject)
}

export const injectCurrentClient = () => {
  return inject<currentClientType>(currentClientInject)
}

export const injectSidebarShow = () => {
  return inject<Ref<boolean>>(sidebarShowInject)
}

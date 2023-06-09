export type authModuleState = {
  username: string
  token: string
}

export const authModule = {
  state: {
    username: '',
    token: ''
  },
  mutations: {
    setState(state: authModuleState, newState: authModuleState) {
      state = newState
    }
  }
}

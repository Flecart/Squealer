// TODO: mettere l'indirizzo del server di squealer se non dev, quando si saprà l'indirizzo di squealer
export const squealerBaseURL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'http://localhost:3000'

export const getClientsRoute = `${squealerBaseURL}/api/smm/clients`

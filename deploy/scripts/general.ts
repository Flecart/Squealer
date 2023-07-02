import { addClientRoute, baseUrl, checkAndReportStatus, sendClientRequestRoute } from './globals';
import request from 'supertest';
import { stringFormat } from "@app/utils"

export async function addClientToSmm(clients: string[], smm: string, tokens: Map<string, string>) {
  for (const client of clients) {
    const res1 = await request(baseUrl)
      .post(stringFormat(sendClientRequestRoute, [smm.toLocaleLowerCase()]))
      .set('Authorization', `Bearer ${tokens.get(client)}`)
      .send()
    checkAndReportStatus(res1, 200, `Error sending request to fvSMM`);
    const res2 = await request(baseUrl)
      .post(stringFormat(addClientRoute, [client.toLocaleLowerCase()]))
      .set('Authorization', `Bearer ${tokens.get(smm)}`)
      .send()
    checkAndReportStatus(res2, 200, `Error accept request send to fvSMM`);
  }
}

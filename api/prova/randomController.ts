import { Get, Route, } from '@tsoa/runtime';


@Route('/api/prova')
export class Randomcontroller {
  @Get('/docs')
  getData(): Promise<string> {
    return Promise.resolve('Hello World 2');
  }
}

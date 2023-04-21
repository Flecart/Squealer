import {
    Controller, Get,
  } from '@decorators/express';


@Controller('/prova')
export default class Randomcontroller {
  @Get('/docs')
  getData() {
    return 'Hello World 2';
  }
}

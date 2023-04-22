import { Get, Route, } from '@tsoa/runtime';

// import express from 'express';

@Route('/api')
export class HelloController {
  @Get('/docs')
  getData() {
    return 'Hello World';
  }
}

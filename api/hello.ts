import {
    Controller, Get,
  } from '@decorators/express';


// import express from 'express';

@Controller('/')
export default class HelloController {
  @Get('/docs')
  getData() {
    return 'Hello World';
  }
}

// // function api_Middlewere(req: Request, res: Response): void{
// //     @Get('/docs')
// //     getData(@Response() req, @Request() res){
// //         console.log('Hello Word\n');
// //     }
// // }

// const app = express();

// const port : number = 8099;

// /* const docs_handler = function(req,res){
//     //var docs = {server:'express'};
//     console.log('Hello Word\n');
// } */

// /* app.get('/docs',docs_handler); */

// attachControllers(app, [HelloController]);
// app.listen(port,function(){
//     console.log(`server running at port: ${port}`)
// })

// //export const appE = app;
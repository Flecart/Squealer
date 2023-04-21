import mongoose from "mongoose";
import dotenv from "dotenv";

const env = dotenv.config();

await main().catch(err => console.log(err));
const kittySchema = new mongoose.Schema({
    name: String
});

const Kitten = mongoose.model('Kitten', kittySchema);
const silence = new Kitten({ name: 'Silence' });
console.log(silence.name); // 'Silence'

kittySchema.methods.speak = function speak() {
    const greeting = this.name
      ? 'Meow name is ' + this.name
      : 'I don\'t have a name';
    console.log(greeting);
  };
  
const fluffy = new Kitten({ name: 'fluffy' });
await fluffy.save();
console.log("saved");

async function main() {
    console.log(env);
    // @ts-ignore
    await mongoose.connect(`mongodb+srv://${env.parsed?.MONGO_USER}:${env.parsed?.MONGO_PASS}@${env.parsed?.MONGO_DOMAIN}.mongodb.net/`);
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
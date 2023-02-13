import 'reflect-metadata';
import commandLineArgs from 'command-line-args';
import dotenv from 'dotenv';
import path from 'path';

const options = commandLineArgs([
  {
    name: 'env',
    alias: 'e',
    defaultValue: 'development',
    type: String,
  },
]);

const result2 = dotenv.config({
  path: path.join(__dirname, `../../env/${String(options.env)}.env`),
});

if (result2.error) {
  throw result2.error;
}

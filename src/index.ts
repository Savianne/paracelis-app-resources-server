// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from 'path';
import serveStatic from 'serve-static';
import bodyParser from 'body-parser';
import cors from 'cors';
import UploaderRouter from "../router/uploadRouter";

dotenv.config();

const app: Express = express();
const port = 3001;

dotenv.config();

// parse application/json
app.use(bodyParser.json());

//Setup CORS
app.use(cors());

// app.use(cors({
//   origin: 'http://paracelis-tourist-app.site/', // Replace with your frontend's URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
//   credentials: true, // Allow cookies or authorization headers
// }));

app.use(serveStatic(path.join(__dirname, '../public')))

app.use('/uploader', UploaderRouter);


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
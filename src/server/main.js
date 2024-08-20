// ---------------------------------------------------------
// NPM Packages

import express from 'express';
import ViteExpress from 'vite-express';
import 'express-async-errors';

// ---------------------------------------------------------
// My imports 

// Importing the database will initialize it
import './database/database.js';
import categoryRouter from './controllers/category.js';
import itemRouter from './controllers/item.js';
import loanRouter from './controllers/loan.js';
import middlewares from './utils/middlewares.js';

// ---------------------------------------------------------
// Initialization

const app = express();

// ---------------------------------------------------------
// DB connection

// Importing the database will initialize it

// ---------------------------------------------------------
// Middleware list

app.use(express.json());

// ----------------------------
// Controllers

app.use('/api/category', categoryRouter);
app.use('/api/item', itemRouter);
app.use('/api/loan', loanRouter);

// ----------------------------

app.use(middlewares.errorHandler);

// ---------------------------------------------------------
// Export express app
ViteExpress.listen(app, 10000, () =>
  console.log("Server is listening on port 10000..."),
);

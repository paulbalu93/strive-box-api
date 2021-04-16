import express from 'express';
import uniqid from 'uniqid';

import { check, validationResult } from 'express-validator';
import listEndpoints from 'express-list-endpoints';
import cors from 'cors';
import { join } from 'path';
import studentsRoutes from './students/index.js';
import moviesRoutes from './movies/index.js';
import problematicRoutes from './problematicRoutes/index.js';
import filesRoutes from './files/index.js';
import {
	badRequestErrorHandler,
	notFoundErrorHandler,
	forbiddenErrorHandler,
	catchAllErrorHandler,
} from './errorHandling.js';
import { getCurrentFolderPath } from './lib/fs-tools.js';

const server = express();
server.use(express.static(publicFolderPath));
const port = process.env.PORT || 3000;

server.use(cors());
server.use(express.json());
server.use(
	'/students',
	[
		(req, res, next) => {
			console.log("Hello I'm the third middleware");
			next();
		},
		loggerMiddleware,
	],
	studentsRoutes
); // router level
server.use('/files', filesRoutes);

// ERROR MIDDLEWARES (AFTER ROUTES)

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(forbiddenErrorHandler);
server.use(catchAllErrorHandler);

console.log(listEndpoints(server));

server.listen(port, () => console.log('Server running on port: ', port));

import express from 'express';
import { writeStudentsPictures, readStudentsPictures } from '../lib/fs-tools.js';
import multer from 'multer';
import { pipeline } from 'stream';
import zlib from 'zlib';

const router = express.Router();

router.post('/upload', multer().single('profilePic'), async (req, res, next) => {
	try {
		console.log(req.file);
		await writeStudentsPictures(req.file.originalname, req.file.buffer);
		res.send('ok');
	} catch (error) {
		console.log(error);
	}
});

router.post('/uploadMultiple', multer().array('multipleProfilePic', 2), async (req, res, next) => {
	try {
		const arrayOfPromises = req.files.map(
			async (file) => await writeStudentsPictures(file.originalname, file.buffer)
		);

		await Promise.all(arrayOfPromises);
		res.send('ok');
	} catch (error) {
		console.log(error);
	}
});

router.get('/:fileName/download', async (req, res, next) => {
	try {
		// source (fileOnDisk, req, ...) --> destination (fileOnDisk, res, ...)
		// source --> readable stream, destination --> writable stream

		// source (fileOnDisk, req, ...) --> transform chunk by chunk (zip, csv) --> destination (fileOnDisk, res, ...)
		// source --> readable stream, transform --> transform stream, destination --> writable stream

		res.setHeader('Content-Disposition', `attachment;`); // header needed to tell the browser to open the "save file as " window

		const source = readStudentsPictures(req.params.fileName); // creates a readable stream on that file on disk
		const destination = res; // response object is a writable stream used as the destination

		pipeline(source, zlib.createGzip(), destination, (err) => console.log(err)); // with pipeline we connect together a source and a destination
	} catch (error) {}
});

export default router;

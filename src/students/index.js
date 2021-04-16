import express from 'express';

import uniqid from 'uniqid';
import { check, validationResult } from 'express-validator';
import { getStudents, writeStudents } from '../lib/fs-tools.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		const students = await getStudents();

		if (req.query && req.query.name) {
			const filteredStudents = students.filter(
				(student) => student.hasOwnProperty('name') && student.name === req.query.name
			);

			res.send(filteredStudents);
		} else {
			res.send(students);
		}
	} catch (error) {
		console.log(error);
		next(error); // SENDING ERROR TO ERROR HANDLERS (no httpStatusCode automatically means 500)
	}
});

router.get('/:id', async (req, res, next) => {
	//http://localhost:3002/students/123412312
	try {
		const students = await getStudents();

		const student = students.find((student) => student.ID === req.params.id);
		if (student) {
			res.send(student);
		} else {
			const err = new Error('User not found');
			err.httpStatusCode = 404;
			next(err);
		}
	} catch (error) {
		console.log(error);
		next(error);
	}
});

router.post(
	'/',
	[
		check('name').exists().withMessage('Name is mandatory field!'),
		check('age').isInt().withMessage('Age must be an integer!'),
	],
	async (req, res, next) => {
		try {
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				// if we had errors
				const err = new Error();
				err.errorList = errors;
				err.httpStatusCode = 400;
				next(err);
			} else {
				const students = await getStudents();
				const newStudent = { ...req.body, ID: uniqid(), createdAt: new Date() };

				students.push(newStudent);

				await writeStudents(students);

				res.status(201).send({ id: newStudent.ID });
			}
		} catch (error) {
			error.httpStatusCode = 500;
			next(error);
		}
	}
);

router.put('/:id', async (req, res, next) => {
	try {
		const students = await getStudents();

		const newStudents = students.filter((student) => student.ID !== req.params.id);

		const modifiedStudent = { ...req.body, ID: req.params.id, modifiedAt: new Date() };

		newStudents.push(modifiedStudent);
		await writeStudents(newStudents);

		res.send(modifiedStudent);
	} catch (error) {
		console.log(error);
	}
});

router.delete('/:id', async (req, res, next) => {
	try {
		const students = await getStudents();

		const newStudents = students.filter((student) => student.ID !== req.params.id);
		await writeStudents(newStudents);
		res.status(204).send();
	} catch (error) {
		console.log(error);
	}
});

export default router;

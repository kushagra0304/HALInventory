import express from 'express';
import db from '../database/database.js'

const router = express.Router();

const insertIntoCategory = db.prepare(`INSERT INTO category (name) VALUES (?)`);

router.post('', async (request, response) => {
    const { name } = request.body;

    if(!(typeof name === 'string')) {
        response.status(400).send('Invalid name');
        return;
    }

    insertIntoCategory.run(name);

    response.end();
})

const searchInCategory = db.prepare(`SELECT name FROM category WHERE name LIKE ? OR id = ?`);

router.get('/search', async (request, response) => {
    let { q } = request.query;

    if(!q) {
        q = "";
    }

    const rows = searchInCategory.all(`%${q}%`, q);

    response.json(rows);
})

export default router;
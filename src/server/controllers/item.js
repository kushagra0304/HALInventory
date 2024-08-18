import express from 'express';
import db from '../database/database.js'

const router = express.Router();

const insertIntoItem = db.prepare('INSERT INTO item (name, category_id) VALUES (?, ?)');
const insertIntoItemAttribute = db.prepare(`INSERT INTO item_attribute (name, item_id, required) VALUES (?, ?, ?)`)

router.post('', async (request, response) => {
    const { name, attributes, category_id } = request.body;

    const transaction = db.transaction(() => {
        const { lastInsertRowid } = insertIntoItem.run(name, category_id);

        attributes.forEach((attribute) => {
            insertIntoItemAttribute.run(attribute.name, lastInsertRowid, attribute.required);
        });
    })

    transaction();

    response.end();
})

const searchInItem = db.prepare('SELECT name FROM item WHERE name LIKE ?');

router.get('/search', async (request, response) => {
    let { q } = request.query;

    if(!q) {
        q = "";
    }

    const rows = searchInItem.all(q);

    response.json(rows);
})

const getItem = db.prepare('SELECT * FROM item WHERE id = ?');
const getItemAttributes = db.prepare('SELECT * FROM item_attribute WHERE item_id = ?');
const getCategoryName = db.prepare('SELECT name FROM category WHERE id = ?');

router.get('/:id', async (request, response) => {
    const { id } = request.params;

    const item = {}

    let data = getItem.get(id);
    item.name = data.name;
    item.category_id = data.category_id;
    item.category = getCategoryName.get(data.category_id).name;

    data = getItemAttributes.all(id);
    item.attributes = data.reduce((attributes, row) => {
        attributes.push({
            name: row.name,
            required: row.required,
            id: row.id
        })
        return attributes;
    }, []);

    response.json(item);
})

const insertIntoItemVariation = db.prepare('INSERT INTO item_variation (item_id, quantity) VALUES (?, ?)');
const insertIntoItemVariationValue = db.prepare('INSERT INTO item_variation_value (item_variation_id, item_attribute_id, item_attribute_val) VALUES (?, ?, ?)');
const insertIntoItemStock = db.prepare('INSERT INTO item_stock (item_variation_id, loaned) VALUES (?, ?)');

// fix this
router.post('/variation', async (request, response) => {
    const { item_id, attributeValues, quantity } = request.body;

    const transaction = db.transaction(() => {
        const { lastInsertRowid } = insertIntoItemVariation.run(item_id, quantity);

        const itemAttributes = getItemAttributes.all(item_id);

        itemAttributes.forEach((itemAttribute) => {
            const attributeValue = attributeValues.find((attributeValue) => itemAttribute.id === attributeValue.id);

            if(!attributeValue){
                if(itemAttribute.required === 1){
                    console.log(itemAttribute)
                    throw new Error(`Missing required attribute when inserting item variation.`);
                } 
            }

            insertIntoItemVariationValue.run(lastInsertRowid, itemAttribute.id, attributeValue ? attributeValue.value : "");
        });

        for(let i = 0; i < quantity; i++) {
            insertIntoItemStock.run(lastInsertRowid, 0);
        }
    })

    transaction();

    response.end();
})

const getStock = db.prepare('SELECT * FROM item_stock WHERE id = ?');
const getItemVariationValues = db.prepare('SELECT * FROM item_variation_value WHERE item_variation_id = ?');
const getItemAttribute = db.prepare('SELECT * FROM item_attribute WHERE id = ?');
const getItemVariation = db.prepare('SELECT * FROM item_variation WHERE id = ?');

router.get('/stock/:id', async (request, response) => {
    const { id } = request.params;

    const stock = {}
    let data;
    
    // Fetching row from stock table
    data = getStock.get(id);
    stock.loaned = data.loaned;

    const item_variation_id = data.item_variation_id;

    // Fetching rows from item_variation_values table
    data = getItemVariationValues.all(item_variation_id);

    stock.attributes = [];

    for(let i = 0; i < data.length; i++) {
        const itemAttribute = getItemAttribute.get(data[i].item_attribute_id);
        stock.attributes.push({
            [itemAttribute.name]: data[i].item_attribute_val
        })
    }

    // Fetching row from item_variation table 
    data = getItemVariation.get(item_variation_id);

    // Fetching row from item table
    data = getItem.get(data.item_id);
    stock.name = data.name;

    // Fetching row from category table
    data = getCategoryName.get(data.category_id);
    stock.category = data.name;

    response.json(stock);
})

export default router;
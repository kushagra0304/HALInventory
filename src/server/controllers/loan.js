import express from 'express';
import db from '../database/database.js'

const router = express.Router();

const getStock = db.prepare('SELECT * FROM item_stock WHERE id = ?');
const insertIntoLoan = db.prepare('INSERT INTO loan (stock_id, emp_id, from_date, to_date) VALUES (?, ?, ?, ?)');
const updateStockLoan = db.prepare('UPDATE item_stock SET loaned = ? WHERE id = ?');
// Grant loan
router.post('/grant', async (request, response) => {
    const { stock_id, emp_id } = request.query;

    const { loaned } = getStock.get(stock_id);

    if(loaned) {
        response.status(400).send('Item is already loaned');
        return;
    }
    const transaction = db.transaction(() => {
        insertIntoLoan.run(stock_id, emp_id, new Date().toISOString(), null);
        updateStockLoan.run(1, stock_id)
    });
    transaction();

    response.end();
})

const getLoan = db.prepare('SELECT * FROM loan WHERE id = ?');
const updateLoanTo = db.prepare('UPDATE loan SET to_date = ? WHERE stock_id = ? and to_date IS NULL');
// Revoke loan
router.post('/revoke', async (request, response) => {
    const { stock_id } = request.query;

    const { loaned } = getStock.get(stock_id);

    if(!loaned) {
        response.status(400).send('Item is not loaned to anyone');
        return;
    }

    const transaction = db.transaction(() => {
        updateLoanTo.run(new Date().toISOString(), stock_id);
        updateStockLoan.run(0, stock_id)
    });
    transaction();

    response.end();
})

const getItemVariation = db.prepare('SELECT * FROM item_variation WHERE id = ?');
const getItem = db.prepare('SELECT * FROM item WHERE id = ?');
const getCategory = db.prepare('SELECT * FROM category WHERE id = ?');
const getItemVariationValues = db.prepare('SELECT * FROM item_variation_value WHERE item_variation_id = ?');
const getItemAttribute = db.prepare('SELECT * FROM item_attribute WHERE id = ?');
const getStockItemHistory = db.prepare('SELECT * FROM loan WHERE stock_id = ? ORDER BY from_date');
const getEmployee = db.prepare('SELECT * FROM employee WHERE id = ?');
// Get stock item loan history

// const data = {
//     item: {
//         id: "",
//         name: "",
//         category: "",
//         loaned: "",
//         attributes: [
//             {key: name},
//         ]
//     },
//     history: [
//         {
//             from_date: "",
//             to_date: "",
//             employee: {
//                 id: "",
//                 name: ""
//             }
//         }
//     ]
// }

router.get('/history/stock/:id', async (request, response) => {
    const { id } = request.params;

    const data = {};

    // Fetching stock
    const stock = getStock.get(id);

    if(!stock) {
        response.status(400).send("Invalid stock id");
    }

    data.item = {
        loaned: stock.loaned
    }

    // Fetching itemVariation
    const itemVariation = getItemVariation.get(stock.item_variation_id);

    // Fetching item 
    const item = getItem.get(itemVariation.item_id);

    data.item.id = itemVariation.item_id;
    data.item.name = item.name;

    // Fetching category
    const category = getCategory.get(item.category_id);

    data.item.category = category.name;

    // Fetching attributes (table item_variation_value)
    const itemVariationValues = getItemVariationValues.all(itemVariation.id);

    data.item.attributes = [];

    for(let i = 0; i < itemVariationValues.length; i++) {
        const itemAttribute = getItemAttribute.get(itemVariationValues[i].item_attribute_id);
        data.item.attributes.push({
            [itemAttribute.name]: itemVariationValues[i].item_attribute_val
        })
    }

    // Fetching loan history (table loan)
    const history = getStockItemHistory.all(id);

    data.history = [];

    for(let i = 0; i < history.length; i++) {
        const employee = getEmployee.get(history[i].emp_id);
        data.history.push({
            from_date: history[i].from_date,
            to_date: history[i].to_date,
            employee: {
                id: employee.id,
                name: employee.name
            }
        })
    }

    response.json(data);
}, []);

const getEmpHistory = db.prepare('SELECT * FROM loan WHERE emp_id = ? ORDER BY from_date DESC');
// Get employee loan history

// const data = {
//     employee: {
//         id: "",
//         name: "",
//         dept_id: "",
//         landline: "",
//         mobile_number: "", 
//         grade: "",
//     },
//     history: [
//         {
//             from_date: "",
//             to_date: "",
//             item: {
//                 name: "",
//                 id: "" 
//             }
//         }
//     ]
// }

router.get('/history/employee/:id', async (request, response) => {
    const { id } = request.params;

    const data = {};

    // Fetching employee
    const employee = getEmployee.get(id);

    if(!employee) {
        response.status(400).send("Invalid employee id");
    }

    data.employee = {
        id: employee.id,
        name: employee.name,
        dept_id: employee.dept_id,
        landline: employee.landline,
        mobile_number: employee.mobile_number, 
        grade: employee.grade,
    }

    // Fetching loan history (table loan)
    const history = getEmpHistory.all(id);

    data.history = [];

    for(let i = 0; i < history.length; i++) {
        const stock = getStock.get(history[i].stock_id);
        const itemVariation = getItemVariation.get(stock.item_variation_id);
        const item = getItem.get(itemVariation.item_id);

        data.history.push({
            from_date: history[i].from_date,
            to_date: history[i].to_date,
            item: {
                name: item.name,
                id: item.id,
            }
        })
    }
    
    response.json(data);
})

export default router;
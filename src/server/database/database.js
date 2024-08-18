import Database from 'better-sqlite3'
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

try {
    db = new Database(path.resolve(__dirname, './data/database.sqlite'));

    process.on('exit', () => db.close());

    db.pragma('foreign_keys = ON');

    const transaction = db.transaction(() => {
        db.prepare(`
            CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `).run()
    
        db.prepare(`
            CREATE TABLE IF NOT EXISTS category (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )
        `).run()
    
        db.prepare(`
            CREATE TABLE IF NOT EXISTS item (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                category_id INTEGER NOT NULL,
                FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE RESTRICT
            )
        `).run()
    
        db.prepare(`
            CREATE TABLE IF NOT EXISTS item_attribute (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                item_id INTEGER NOT NULL,
                required INTEGER NOT NULL CHECK (required IN (0, 1)),
                FOREIGN KEY (item_id) REFERENCES item (id)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            )
        `).run()
    
        db.prepare(`
            CREATE TABLE IF NOT EXISTS item_variation (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                FOREIGN KEY (item_id) REFERENCES item (id) ON DELETE RESTRICT
            )
        `).run()
    
        db.prepare(`
            CREATE TABLE IF NOT EXISTS item_variation_value (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_variation_id INTEGER NOT NULL,
                item_attribute_id INTEGER NOT NULL,
                item_attribute_val TEXT NOT NULL,
                FOREIGN KEY (item_attribute_id) REFERENCES item_attribute (id) ON DELETE RESTRICT,
                FOREIGN KEY (item_variation_id) REFERENCES item_variation (id)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            )
        `).run()

        db.prepare(`
            CREATE TABLE IF NOT EXISTS item_stock (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_variation_id INTEGER NOT NULL,
                loaned INTEGER NOT NULL CHECK (loaned IN (0, 1)),
                FOREIGN KEY (item_variation_id) REFERENCES item_variation (id)
            )
        `).run()
    })

    transaction();
} catch(err) {
    console.error(`Error init database ${err}`);

    db.exec('ROLLBACK;');

    // cleanup
    if(!db) {
        db.close();
    }
}

export default db;
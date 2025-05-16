// @ts-check
import fs from 'fs';

/**@type {boolean} */
const database = fs.existsSync('database/database.sql');

if (!database) {
    fs.writeFileSync('database/database.sql', '');
    console.log('\x1b[32mDatabase file created.\x1b[0m');
}

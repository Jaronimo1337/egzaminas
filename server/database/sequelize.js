// @ts-check
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
const DB_HOST = process.env.DB_HOST || '';
const DB_NAME = process.env.DB_NAME || '';
const DB_USER = process.env.DB_USER || '';
const DB_PASS = process.env.DB_PASS || '';
const DB_PORT = process.env.DB_PORT || '';

/**@type {object}*/
const databaseOptions = {
    /**@type {string}*/
    dialect: 'postgres',
    /**@type {string}*/
    host: DB_HOST,
    /**@type {string}*/
    port: DB_PORT,
    /**@type {string}*/
    database: DB_NAME,
    /**@type {string}*/
    username: DB_USER,
    /**@type {string}*/
    password: DB_PASS,
    /**@type {boolean}*/
    logging: false,
};

/**@type {Sequelize}*/
const sq = new Sequelize(databaseOptions);

try {
    sq.authenticate();
    console.log(
        `\x1b[36mConnected to database \x1b[35m${DB_NAME}\x1b[36m as \x1b[35m${DB_USER}\x1b[36m (${DB_HOST}: ${DB_PORT})`,
        '\x1b[0m'
    );
} catch (error) {
    console.error(error);
}

export default sq;

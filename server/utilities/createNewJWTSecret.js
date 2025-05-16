// @ts-check
import { nanoid } from 'nanoid';
import { sha256 } from 'js-sha256';
import fs from 'fs';
import os from 'os';

/**@returns {string}*/
const newSecret = () => {
    /**@type {string}*/
    const string = nanoid(64);
    /**@type {string}*/
    const hash = sha256(string);
    return hash;
};

/**
 * @param {string} key
 * @param {string} value
 */
const setEnvValue = (key, value) => {
    /**@type {string[]}*/
    const ENV_VARS = fs.readFileSync('.env', 'utf8').split(os.EOL);
    /**@type {number}*/
    const target = ENV_VARS.indexOf(
        ENV_VARS.find((line) => {
            /**@type {RegExp}*/
            const keyValRegex = new RegExp(`(?<!#\\s*)${key}(?==)`);
            return keyValRegex.exec(line);
        }) || ''
    );
    if (target !== -1) {
        ENV_VARS.splice(target, 1, `${key}=${value}`);
    } else {
        ENV_VARS.push(`${key}=${value}`);
    }
    fs.writeFileSync('.env', ENV_VARS.join(os.EOL));
};

/**@type {string}*/
const secret = newSecret();
setEnvValue('JWT_SECRET', secret);
console.log('\x1b[34mNew env var \x1b[31m"JWT_SECRET"\x1b[34m created.\x1b[0m');

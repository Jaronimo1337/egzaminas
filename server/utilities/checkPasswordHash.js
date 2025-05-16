// @ts-check
import { sha1 } from 'js-sha1';
import { sha256 } from 'js-sha256';

/**@type {string}*/
const password = 'Admin123.';
/**@type {string}*/
const hashedPassword = sha256(sha1(password));
/**@type {string}*/
const username = 'admin';
/**@type {string}*/
const salt = sha256(sha1(new Date().toString() + username));
/**@type {string}*/
const fullPassword = sha256(sha1(password + salt));

console.log(hashedPassword, fullPassword + ':' + salt);

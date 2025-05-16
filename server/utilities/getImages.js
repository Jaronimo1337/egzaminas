// @ts-check
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

/**@returns {string}*/
const images = () => {
    /**@type {string}*/
    const __filename = fileURLToPath(import.meta.url);
    /**@type {string}*/
    const __dirname = dirname(__filename);
    /**@type {string}*/
    const images = path.join(__dirname, '..', 'public', 'images');
    return images;
};

export default images;

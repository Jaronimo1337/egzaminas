// @ts-check
import fs from 'fs';
import images from '../utilities/getImages.js';

const cleanup = async () => {
    /**@type {object}*/
    const rmOptions = {
        /**@type {boolean}*/
        recursive: true,
        /**@type {boolean}*/
        force: true,
    };
    fs.rmSync(images(), rmOptions);

    /**@type {object}*/
    const mkOptions = {
        /**@type {boolean}*/
        force: true,
    };
    if (!fs.existsSync(images())) fs.mkdirSync(images(), mkOptions);
    console.log('\x1b[0mImages\x1b[30m directory cleaned up\x1b[0m');
};

export default cleanup;

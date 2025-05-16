import axios from 'axios';
import url from './getURL.js';

const createProduct = async (data) => {
    const {
        category_id,
        subcategory_id,
        name,
        price,
        description,
        amount_in_stock,
        images,
    } = data;
    try {
        const newProduct = await axios.post(
            url('products/user'),
            {
                category_id,
                subcategory_id,
                name,
                price,
                description,
                amount_in_stock,
            },
            { withCredentials: true }
        );
        const { id } = newProduct.data.data;
        await axios.post(
            url('upload/dir'),
            { dirName: `product${id}` },
            {
                withCredentials: true,
            }
        );
        for (const image in images) {
            const formData = new FormData();
            formData.append('images', images[image]);
            await axios.post(url('upload/images'), formData, {
                withCredentials: true,
            });
        }
        const allProductImages = await axios.get(url(`images/d/product${id}`), {
            withCredentials: true,
        });
        const frontCover = allProductImages.data.data[0];
        const updatedProduct = await axios.patch(
            url(`products/user/p/${id}`),
            { image_url: frontCover },
            { withCredentials: true }
        );
        return updatedProduct.data;
    } catch (error) {
        console.log(error);
    }
};

export default createProduct;

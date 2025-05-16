import axios from 'axios';
import url from './getURL.js';

const createComment = async (data) => {
    const { product_id, comment, stars, images } = data;
    try {
        // 1. Sukuriame komentarą
        const newComment = await axios.post(
            url('comments/comment'),
            { product_id, comment, stars },
            { withCredentials: true }
        );
        const { id } = newComment.data.data;
        console.log('Komentaro ID:', id);

        // 2. Sukuriame aplanką ir įkeliame paveikslėlius
        if (images && images.length > 0) {
            await axios.post(
                url('upload/dir'),
                { dirName: `comment${id}` },
                { withCredentials: true }
            );
            for (const image of images) {
                const formData = new FormData();
                formData.append('images', image);
                await axios.post(url('upload/images'), formData, {
                    withCredentials: true,
                });
            }

            // 3. Gauname paveikslėlius
            const allCommentImages = await axios.get(
                url(`images/c/comment${id}`),
                {
                    withCredentials: true,
                }
            );
            console.log(
                'Gauti paveikslėliai arba klaida:',
                allCommentImages.response?.data || allCommentImages
            );
            const frontCover = allCommentImages.data.data[0];

            // 4. Atnaujiname komentarą su image_url
            const updatedComment = await axios.patch(
                url(`comments/comment/${id}`),
                { image_url: frontCover },
                { withCredentials: true }
            );
            return updatedComment.data;
        }

        // Jei nėra paveikslėlių, grąžiname tik sukurtą komentarą
        return newComment.data;
    } catch (error) {
        console.log('Klaida kuriant komentarą:', error);
        throw error;
    }
};

export default createComment;

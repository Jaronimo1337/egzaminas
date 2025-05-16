import { useState } from 'react';
import ProductCreateModal from './ProductCreateModal.jsx';
import MyProductList from './MyProductList.jsx';

const MyProducts = () => {
    const [productCreateModal, setProductCreateModal] = useState();
    const [update, setUpdate] = useState(0);

    const handleProductCreate = () => {
        setProductCreateModal(true);
    };

    return (
        <>
            <div className="flex justify-center  w-full h-screen bg-gray-50">
                <div className="w-full p-8 bg-white rounded-lg shadow-lg">
                    <div className="flex items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            My products
                        </h2>
                    </div>
                    <div className="flex items-center">
                        <h2 className="">Add a product</h2>
                        <button
                            onClick={handleProductCreate}
                            className="text-white bg-orange-600 rounded-xl px-4 py-2 ml-2 flex justify-center items-center hover:cursor-pointer"
                        >
                            +
                        </button>
                        {productCreateModal ? (
                            <ProductCreateModal
                                showModal={productCreateModal}
                                setShowModal={setProductCreateModal}
                                setUpdate={setUpdate}
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                    <section>
                        <MyProductList update={update} setUpdate={setUpdate} />
                    </section>
                </div>
            </div>
        </>
    );
};

export default MyProducts;

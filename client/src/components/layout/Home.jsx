import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

const HomeRedirect = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        navigate('/categories/1');
    }, [navigate]);
    return <div className="p-4 text-center">Loading...</div>;
};

const Home = () => {
    return (
        <>
            <HomeRedirect />
        </>
    );
};

export default Home;
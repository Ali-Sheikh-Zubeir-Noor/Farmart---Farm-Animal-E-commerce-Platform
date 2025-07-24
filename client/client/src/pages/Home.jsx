import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimalCard from '../components/AnimalCard';

export default function Home() {
    const [animals, setAnimals] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (!token) {
    //         navigate('/login');
    //         return;
    //     }

    //     fetch('http://localhost:5000/animals', {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //     })
    //         .then((res) => {
    //             if (res.status === 401) {
    //                 navigate('/login');
    //             }
    //             return res.json();
    //         })
    //         .then((data) => setAnimals(data))
    //         .catch((err) => {
    //             setError('Failed to load animals');
    //             console.error(err);
    //         });
    // }, [navigate]);

    return (
        <div className="p-6 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
                Welcome to FarmMart 🐄🐐🐓
            </h1>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* {animals.map((animal) => ( */}
                    <AnimalCard
                        name="Cow"
                        breed="Friesian"
                        price={55000}
                        image="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80"
                        onBuy={() => console.log('Buying cow')}
                    />

                {/* ))} */}
            </div>
        </div>
    );
}

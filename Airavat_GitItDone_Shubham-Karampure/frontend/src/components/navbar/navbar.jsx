'use client';
import { useState, useEffect } from 'react';
import { Search, User, Bell, MessageSquare, Film } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setIsUserLoggedIn(true);
        }
    }, []);

    const handleLogout = async () => {
        router.push('/userprofile');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
    };

    return (
        <nav className="!bg-white mb-4">
            <div className="max-w-7xl mt-3 px-4">
                <div className="flex items-center w-[97vw] justify-between h-16">
                    {/* Logo and Search */}
                    <div className="flex mr-2 items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-5xl text-purple-600 tracking-wide transform -rotate-2 mr-4">
                                <span className="text-yellow-500">Comic</span>
                                <span className="text-purple-600">Pedia</span>
                                <span className="text-xs absolute top-0 right-0 bg-red-500 text-white px-1 rounded-full transform rotate-12">POW!</span>
                            </h1>
                        </div>
                        <div className="ml-6">
                            <form onSubmit={handleSearch} className="flex">
                                <div className="relative rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        className="py-2 px-4 pr-10 block w-64 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 transition duration-200"
                                        placeholder="Search Wikitoon..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="ml-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-200"
                                >
                                    Enter
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Conditionally Render User Features */}
                    {isUserLoggedIn && (
                        <div className="flex items-center space-x-8">
                            <Link href="/video">
                                <button className="text-gray-600 hover:text-purple-600 focus:outline-none transition duration-200 relative group">
                                    <Film className="h-7 w-7" />
                                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">Shorts</span>
                                </button>
                            </Link>

                            <button className="text-gray-600 hover:text-purple-600 focus:outline-none transition duration-200 relative group">
                                <Bell className="h-7 w-7" />
                                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">Notifications</span>
                            </button>


                            <button className="inline-flex items-center justify-center p-1 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 relative group">
                                <User className="h-7 w-7" onClick={handleLogout} />
                                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-200">Profile</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&display=swap');
                body {
                    font-family: 'Comic Neue', cursive;
                }
                h1, h2, h3, h4, h5, h6 {
                    font-family: 'Bangers', cursive;
                    letter-spacing: 1px;
                }
            `}</style>
        </nav>
    );
}

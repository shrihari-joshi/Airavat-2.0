"use client"
import React, { useState, useEffect } from 'react';
import { generateComic } from '@/api/genApi'; // Assuming this API function exists and works
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Recommended from './recommended'; // Assuming these components exist
import Trending from './trending'; // Assuming these components exist

// Define your backend base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // Use environment variable or default

const HeroPage = () => {
    // --- State Variables ---
    // Search (Keep if used elsewhere, otherwise remove)
    // const [searchTerm, setSearchTerm] = useState('');

    // User Auth
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); // Stores parsed user data

    // Comic Creation Dialog
    const [showDialog, setShowDialog] = useState(false);
    const [comicData, setComicData] = useState({
        topic: '',
        style: 'manga',
        complexity: 'medium',
        age: 'teens'
    });
    const [isLoading, setIsLoading] = useState(false); // Loading for comic *creation*
    const [comicResult, setComicResult] = useState(null);
    const [error, setError] = useState(null); // Error for comic *creation* or article *click*

    // Comic Blog Fetching (NEW)
    const [comicBlogs, setComicBlogs] = useState([]); // To store fetched blogs
    const [isLoadingBlogs, setIsLoadingBlogs] = useState(true); // Loading for blog *fetching*
    const [blogFetchError, setBlogFetchError] = useState(null); // Error for blog *fetching*

    const router = useRouter();

    // --- Effects ---

    // Effect: Check Login Status on Mount
    useEffect(() => {
        try {
            const userDataString = localStorage.getItem('user');
            if (userDataString) {
                const parsedUser = JSON.parse(userDataString);
                if (parsedUser && typeof parsedUser === 'object' && parsedUser._id) {
                    setIsLoggedIn(true);
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem('user');
                }
            }
        } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            localStorage.removeItem('user');
        }
    }, []);

    // Effect: Fetch Comic Blogs on Mount (NEW)
    useEffect(() => {
        const fetchBlogs = async () => {
            setIsLoadingBlogs(true);
            setBlogFetchError(null);
            try {
                // Using POST as specified in the backend route definition
                const response = await axios.post(`${API_BASE_URL}/chapter/get-comicblogs`, {});
                console.log("API Response:", response);

                if (response.data && Array.isArray(response.data.blogs)) {
                    const fetchedBlogs = response.data.blogs;
                    console.log("Fetched blogs:", fetchedBlogs);

                    // Update state
                    setComicBlogs(fetchedBlogs);

                    // Don't try to log the updated state here - it won't reflect the new value yet
                } else {
                    console.warn("Received unexpected data format for blogs:", response.data);
                    setComicBlogs([]); // Set to empty array if format is wrong
                    setBlogFetchError("Could not load articles. Invalid data received.");
                }
            } catch (err) {
                console.error('Error fetching comic blogs:', err);
                setBlogFetchError(err.response?.data?.message || err.message || 'Failed to fetch articles.');
            } finally {
                setIsLoadingBlogs(false);
            }
        };

        fetchBlogs();
    }, []); // Empty dependency array ensures this runs once on mount

    // To see the updated state, you can add another useEffect that watches comicBlogs:
    useEffect(() => {
        console.log("comicBlogs state updated:", comicBlogs);
        // Your code that depends on comicBlogs being updated
    }, [comicBlogs]);

    // --- Handlers ---

    // Dialog Control
    const handleDialogOpen = () => {
        if (!isLoggedIn) {
            router.push('/signin'); // Redirect to signin if not logged in
            return;
        }
        setShowDialog(true);
        setError(null);
        setComicResult(null);
    };

    const handleDialogClose = () => {
        setShowDialog(false);
        setError(null); // Clear errors when closing
    };

    // Comic Creation Form Input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setComicData(prev => ({ ...prev, [name]: value }));
    };

    // Comic Creation Submit
    const handleCreateComic = async (e) => {
        e.preventDefault();
        if (!comicData.topic.trim()) {
            setError("Please enter a topic for your comic.");
            return;
        }
        if (!user?._id) { // Check for user ID specifically
            setError("User data not found. Please log in again.");
            // Optionally redirect or clear state
            // setIsLoggedIn(false);
            // setUser(null);
            // localStorage.removeItem('user');
            // router.push('/signin');
            return;
        }

        setIsLoading(true);
        setError(null);
        setComicResult(null);

        try {
            const result = await generateComic({
                topic: comicData.topic,
                style: comicData.style,
                complexity: comicData.complexity,
                age: comicData.age,
                // Safely access user properties with defaults
                education: user?.education_level || 'middle_school',
                domain: user?.domains || 'general',
                // Add user ID if your API needs it
                // userId: user._id
            });

            setComicResult(result); // Keep result for potential success message
            localStorage.setItem("comic", JSON.stringify(result)); // Save the generated comic data
            router.push("/article"); // Navigate to the article/comic view page

            // Optionally close the dialog on success after a short delay
            // setTimeout(() => {
            //   handleDialogClose();
            // }, 1500);

        } catch (err) {
            console.error("Comic generation error:", err);
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred during comic generation.');
        } finally {
            setIsLoading(false);
        }
    };

    // Login/Signup Navigation
    const handleLogin = () => {
        router.push('/signin'); // Use Next.js router for navigation
    };

    const handleSignUp = () => {
        router.push('/signup'); // Use Next.js router for navigation
    };

    // Article Click Handler (Fetches specific blog)
    const handleArticleClick = async (title) => {
        console.log("Clicked article with title:", title);
        // Optionally show a loading state specific to this action
        setError(null); // Clear previous errors
        try {
            const response = await axios.post(`${API_BASE_URL}/comic-blog/get-comic-blog`, { title });
            console.log("Fetched specific comic blog:", response.data);
            if (response.data?.comicBlog) {
                localStorage.setItem("comic", JSON.stringify(response.data.comicBlog));
                console.log("Specific comic blog saved to localStorage");
                router.push("/article");
            } else {
                console.error("Comic blog data not found in response for title:", title);
                setError('Could not load the selected comic.'); // Set user-friendly error
            }
        } catch (err) {
            console.error("Error fetching specific comic blog:", err);
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred while loading the comic.');
        } finally {
            // Hide loading state if you added one
        }
    };

    // --- JSX Rendering ---
    return (
        <div className="min-h-screen bg-purple-700 font-comic">
            {/* Hero Section */}
            <div className="relative overflow-hidden" style={{
                backgroundImage: "url('https://readdy.ai/api/search-image?query=comic%20book%20style%20background%20with%20purple%20color%20scheme%2C%20halftone%20dots%20pattern%2C%20action%20lines%2C%20dynamic%20comic%20book%20style%20with%20stars%20and%20geometric%20shapes%2C%20high%20energy%2C%20vibrant&width=1440&height=400&seq=hero1&orientation=landscape')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
                    <div className="flex flex-col md:flex-row items-center">
                        {/* Left Side Content */}
                        <div className="md:w-1/2 text-white mb-8 md:mb-0">
                            {/* Headline */}
                            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 transform -rotate-1">
                                <span className="bg-yellow-500 text-purple-800 px-2 inline-block transform rotate-1 skew-x-3">Transform</span>
                                <span className="bg-blue-500 text-white px-2 inline-block transform -rotate-1 skew-x-3">Wikipedia</span>
                                <span className="block mt-2">
                                    <span className="bg-red-500 px-2 inline-block transform rotate-2 skew-x-3">into</span>
                                    <span className="bg-green-500 text-purple-900 px-2 inline-block transform -rotate-1 skew-x-3">Interactive</span>
                                    <span className="bg-blue-900 text-white px-2 inline-block transform rotate-1 skew-x-3">Comics</span>
                                </span>
                            </h1>
                            {/* Sub-headline */}
                            <p className="text-xl bg-black bg-opacity-50 p-3 rounded-lg transform -rotate-1 border-2 border-white border-dashed mb-6">
                                Making learning engaging and accessible for visual learners through AI-powered comic generation
                                <span className="absolute -right-2 -top-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full transform rotate-12">BOOM!</span>
                            </p>
                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                {isLoggedIn ? (
                                    <button
                                        onClick={handleDialogOpen}
                                        disabled={isLoading} // Disable button when creation dialog is loading
                                        className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-2 px-2 rounded-lg transform hover:scale-105 transition duration-200 border-b-4 border-yellow-600 cursor-pointer !rounded-button whitespace-nowrap disabled:opacity-60"
                                    >
                                        <h1 className="text-3xl md:text-3xl font-extrabold leading-tight -mb-5 transform -rotate-1">
                                            Create
                                        </h1>
                                        <i className="fas fa-bolt ml-2"></i>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleLogin}
                                            className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition duration-200 border-b-4 border-yellow-600 cursor-pointer !rounded-button whitespace-nowrap"
                                        >
                                            Login <i className="fas fa-sign-in-alt ml-2"></i>
                                        </button>
                                        {/* Optional: Add Sign Up button if needed */}
                                        {/* <button
                                            onClick={handleSignUp}
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition duration-200 border-b-4 border-blue-700 cursor-pointer !rounded-button whitespace-nowrap"
                                        >
                                            Sign Up <i className="fas fa-user-plus ml-2"></i>
                                        </button> */}
                                    </>
                                )}
                            </div>
                        </div>
                        {/* Right Side Image */}
                        <div className="md:w-1/2 relative mt-8 md:mt-0">
                            <img
                                src="https://readdy.ai/api/search-image?query=marvel%20superheroes%20like%20Iron%20Man%2C%20Spider-Man%2C%20and%20Captain%20America%20reading%20and%20interacting%20with%20digital%20comics%20and%20tablets%2C%20comic%20book%20art%20style%2C%20dynamic%20poses%2C%20speech%20bubbles%2C%20vibrant%20colors%2C%20comic%20book%20panel%20layout&width=600&height=400&seq=hero2&orientation=landscape"
                                alt="Interactive Comics"
                                className="rounded-lg transform rotate-2 border-4 border-white shadow-2xl"
                            />
                            <div className="absolute -top-10 -right-10 bg-yellow-400 text-purple-900 p-3 rounded-full transform rotate-12 font-bold text-xl border-4 border-white"> WOW! </div>
                            <div className="absolute -bottom-5 -left-5 bg-red-500 text-white p-3 rounded-full transform -rotate-12 font-bold text-xl border-4 border-white"> AMAZING! </div>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 text-yellow-300 text-5xl transform rotate-12"> <i className="fas fa-star"></i> </div>
                <div className="absolute bottom-10 right-10 text-red-400 text-5xl transform -rotate-12"> <i className="fas fa-bolt"></i> </div>
            </div>

            {/* Main Content (Articles, Sidebar) */}
            <div className="bg-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row">
                        {/* Articles Section (DYNAMIC CONTENT) */}
                        <div className="lg:w-2/3 pr-0 lg:pr-8">
                            <div className="flex items-center mb-6">
                                <h2 className="text-3xl font-bold text-purple-800 transform -rotate-1 relative">
                                    <span className="bg-yellow-400 px-3 py-1 inline-block">Latest Comics</span>
                                    {/* Keep a dynamic tag maybe? */}
                                    <span className="absolute -right-10 -top-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full transform rotate-12">NEW!</span>
                                </h2>
                                <div className="ml-4 h-1 flex-grow bg-purple-800" style={{ backgroundImage: 'linear-gradient(90deg, purple 50%, transparent 50%)', backgroundSize: '10px 10px' }}></div>
                            </div>

                            {/* Loading State */}
                            {isLoadingBlogs && (
                                <div className="text-center py-10 text-purple-700">
                                    <p className="text-xl font-semibold">Loading Awesome Comics...</p>
                                    {/* Optional: Add a spinner SVG here */}
                                </div>
                            )}

                            {/* Error State */}
                            {blogFetchError && !isLoadingBlogs && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
                                    <p className="font-bold">Oops!</p>
                                    <p>{blogFetchError}</p>
                                </div>
                            )}

                            {/* Display general error if article click failed */}
                            {error && !isLoading && !isLoadingBlogs && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
                                    <p className="font-bold">Error</p>
                                    <p>{error}</p>
                                </div>
                            )}


                            {/* No Articles Found State */}
                            {!isLoadingBlogs && !blogFetchError && comicBlogs.length === 0 && (
                                <div className="text-center py-10 text-gray-600">
                                    <p className="text-xl font-semibold">No comics found yet. Why not create one?</p>
                                </div>
                            )}

                            {!isLoadingBlogs && !blogFetchError && comicBlogs.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {comicBlogs.map((blog, index) => {
                                        // Safely get the first chapter's image and narration
                                        const firstChapter = blog.chapters?.[0];
                                        const imageUrl = firstChapter?.image_url || 'https://via.placeholder.com/300x200.png?text=No+Image';
                                        const description = firstChapter?.narration_box || 'No description available.';

                                        // Tags system with improved visuals
                                        let tag, tagStyle;
                                        if (index === 0) {
                                            tag = 'NEW';
                                            tagStyle = 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
                                        } else if (index === 1) {
                                            tag = 'TRENDING';
                                            tagStyle = 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white';
                                        } else if (index % 5 === 0) {
                                            tag = 'FEATURED';
                                            tagStyle = 'bg-gradient-to-r from-green-400 to-teal-500 text-white';
                                        }

                                        return (
                                            <div
                                                key={blog._id || index}
                                                className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:scale-105 border border-gray-200 flex flex-col"
                                                onClick={() => handleArticleClick(blog.title)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyPress={(e) => e.key === 'Enter' && handleArticleClick(blog.title)}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Cover for ${blog.title}`}
                                                        className="w-full h-56 object-cover"
                                                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x200.png?text=Image+Not+Available'; }}
                                                    />
                                                    {tag && (
                                                        <div className={`absolute top-3 right-3 ${tagStyle} px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                                                            {tag}
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4">
                                                        <h3 className="text-xl font-bold truncate">{blog.title || 'Untitled Comic'}</h3>
                                                    </div>
                                                </div>

                                                <div className="p-4 flex-1 flex flex-col">
                                                    <p className="text-gray-700 mb-4 text-sm line-clamp-3 flex-1">
                                                        {description}
                                                    </p>

                                                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                                                        <div className="flex items-center space-x-1">
                                                            <span className="text-purple-600">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                </svg>
                                                            </span>
                                                            <span className="text-xs text-gray-500">{blog.chapters?.length || 1} Chapter{blog.chapters?.length !== 1 ? 's' : ''}</span>
                                                        </div>

                                                        <button className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors duration-200">
                                                            Read Now →
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:w-1/3 mt-8 lg:mt-0">
                            {/* Pass fetched blogs if needed, or let them fetch their own data */}
                            <Trending />
                            <Recommended />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-purple-900 text-white py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-6 md:mb-0">
                        <h2 className="text-3xl font-bold text-yellow-400 mb-2">ComicPedia</h2>
                        <p className="text-purple-200">© {new Date().getFullYear()} ComicPedia. All rights reserved.</p> {/* Dynamic Year */}
                    </div>
                    <div className="flex space-x-4 mt-4"> {/* Added margin top */}
                        <a href="#" aria-label="Twitter" className="text-white hover:text-yellow-400 text-3xl"> <i className="fab fa-twitter"></i> </a>
                        <a href="#" aria-label="Facebook" className="text-white hover:text-yellow-400 text-3xl"> <i className="fab fa-facebook"></i> </a>
                        <a href="#" aria-label="Instagram" className="text-white hover:text-yellow-400 text-3xl"> <i className="fab fa-instagram"></i> </a>
                        <a href="#" aria-label="Youtube" className="text-white hover:text-yellow-400 text-3xl"> <i className="fab fa-youtube"></i> </a>
                    </div>
                </div>
            </footer>

            {/* Create Comic Dialog Modal */}
            {showDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 font-comic">
                    <div className="bg-white rounded-lg max-w-lg w-full mx-auto overflow-hidden shadow-2xl border-4 border-purple-500 border-dashed transform transition-all duration-300 scale-100">
                        {/* Dialog Header */}
                        <div className="bg-purple-700 px-6 py-4 flex justify-between items-center border-b-4 border-purple-900">
                            <h3 className="text-2xl font-bold text-yellow-400 transform -rotate-1">
                                <span className="bg-yellow-400 text-purple-900 px-2 py-1 inline-block">Let's Make a Comic!</span> <i className="fas fa-pencil-ruler ml-2 text-yellow-300"></i>
                            </h3>
                            <button
                                onClick={handleDialogClose}
                                disabled={isLoading} // Disable close if creation is in progress
                                className="text-purple-200 hover:text-white text-3xl font-bold transform hover:scale-110 transition duration-150 disabled:opacity-50"
                                aria-label="Close dialog"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Dialog Body with Form */}
                        <form onSubmit={handleCreateComic} className="p-6 space-y-5">
                            {/* Error Message Area (for dialog actions) */}
                            {error && !isLoading && ( // Show error only when not loading
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                                    <p className="font-bold">Oh Snap!</p>
                                    <p>{error}</p>
                                </div>
                            )}
                            {/* Success Message Area (Optional) */}
                            {/* {comicResult && !error && !isLoading && ( ... )} */}

                            {/* Topic Input */}
                            <div>
                                <label htmlFor="topic" className="block text-purple-800 text-lg font-bold mb-1 transform -rotate-1">
                                    Topic <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="topic"
                                    name="topic"
                                    value={comicData.topic}
                                    onChange={handleInputChange}
                                    placeholder="e.g., The Solar System, Photosynthesis..."
                                    required
                                    disabled={isLoading}
                                    className="shadow-inner appearance-none border-2 border-purple-300 rounded-lg w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 disabled:bg-gray-100"
                                />
                            </div>

                            {/* Style Select */}
                            <div>
                                <label htmlFor="style" className="block text-purple-800 text-lg font-bold mb-1 transform rotate-1"> Art Style </label>
                                <select
                                    id="style"
                                    name="style"
                                    value={comicData.style}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="shadow-inner appearance-none border-2 border-purple-300 rounded-lg w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition duration-200 disabled:bg-gray-100"
                                >
                                    <option value="manga">Manga Style</option>
                                    <option value="marvel">Marvel Style</option>
                                    <option value="dc">DC Style</option>
                                    <option value="indie">Indie Comic Style</option>

                                </select>
                            </div>

                            {/* Complexity and Age */}
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label htmlFor="complexity" className="block text-purple-800 text-sm font-bold mb-1 transform -rotate-1"> Complexity </label>
                                    <select id="complexity" name="complexity" value={comicData.complexity} onChange={handleInputChange} disabled={isLoading} className="shadow-inner appearance-none border-2 border-purple-300 rounded-lg w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm transition duration-200 disabled:bg-gray-100" >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="age" className="block text-purple-800 text-sm font-bold mb-1 transform rotate-1"> Target Age </label>
                                    <select id="age" name="age" value={comicData.age} onChange={handleInputChange} disabled={isLoading} className="shadow-inner appearance-none border-2 border-purple-300 rounded-lg w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm transition duration-200 disabled:bg-gray-100" >
                                        <option value="kids">Kids (6-10)</option>
                                        <option value="teens">Teens (11-17)</option>
                                        <option value="adults">Adults (18+)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Dialog Footer with Actions */}
                            <div className="pt-4 flex justify-end space-x-4 border-t border-gray-200 mt-2">
                                <button
                                    type="button"
                                    onClick={handleDialogClose}
                                    disabled={isLoading}
                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-lg transform hover:scale-105 transition duration-200 border-b-4 border-gray-600 cursor-pointer !rounded-button whitespace-nowrap disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !comicData.topic.trim()}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-2 px-5 rounded-lg transform hover:scale-105 transition duration-200 border-b-4 border-yellow-600 cursor-pointer !rounded-button whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            Generate <i className="fas fa-magic ml-2"></i>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Global Styles and Font Imports */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&display=swap');

                /* Apply base font via Tailwind */
                .font-comic {
                    font-family: 'Comic Neue', cursive;
                }

                h1, h2, h3, h4, h5, h6, .font-bangers {
                    font-family: 'Bangers', cursive;
                    letter-spacing: 1px; /* Optional */
                }

                .!rounded-button {
                     border-radius: 10px !important;
                }

                .fab, .fas, .far, .fal, .fad {
                    display: inline-block;
                    font-style: normal;
                    font-variant: normal;
                    text-rendering: auto;
                    -webkit-font-smoothing: antialiased;
                }

                /* Tailwind utility for line clamping */
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default HeroPage;
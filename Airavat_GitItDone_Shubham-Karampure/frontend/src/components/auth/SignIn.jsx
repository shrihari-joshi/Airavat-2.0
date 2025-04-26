"use client";
import { loginUser } from '@/api/authApi';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const SignInF = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
    const [loading, setLoading] = useState(false); // Added loading state
    const router = useRouter();

    const characters = [
        {
            name: 'Spider-Man',
            imageUrl: 'https://readdy.ai/api/search-image?query=Spider-Man%20in%20comic%20style%2C%20vibrant%20colors%2C%20dynamic%20pose%2C%20web-slinging%2C%20against%20city%20backdrop%2C%20detailed%20comic%20book%20art%20style%20with%20bold%20outlines%20and%20vibrant%20colors%2C%20Marvel%20superhero&width=500&height=600&seq=1&orientation=portrait'
        },
        {
            name: 'Iron Man',
            imageUrl: 'https://readdy.ai/api/search-image?query=Iron%20Man%20in%20comic%20style%2C%20red%20and%20gold%20armor%2C%20repulsor%20beams%2C%20flying%20pose%2C%20technological%20background%2C%20detailed%20comic%20book%20art%20style%20with%20bold%20outlines%20and%20vibrant%20colors%2C%20Marvel%20superhero&width=500&height=600&seq=2&orientation=portrait'
        },
        {
            name: 'Batman',
            imageUrl: 'https://readdy.ai/api/search-image?query=Batman%20in%20comic%20style%2C%20dark%20cape%20flowing%2C%20on%20rooftop%2C%20Gotham%20city%20background%2C%20moonlight%2C%20detailed%20comic%20book%20art%20style%20with%20bold%20outlines%20and%20dramatic%20shadows%2C%20DC%20superhero&width=500&height=600&seq=3&orientation=portrait'
        },
        {
            name: 'Naruto',
            imageUrl: 'https://readdy.ai/api/search-image?query=Naruto%20in%20manga%20style%2C%20orange%20outfit%2C%20ninja%20headband%2C%20rasengan%20technique%2C%20dynamic%20action%20pose%2C%20detailed%20manga%20art%20style%20with%20speed%20lines%20and%20expressive%20features%2C%20anime%20character&width=500&height=600&seq=4&orientation=portrait'
        },
        {
            name: 'Luffy',
            imageUrl: 'https://readdy.ai/api/search-image?query=Monkey%20D.%20Luffy%20in%20manga%20style%2C%20straw%20hat%2C%20stretching%20punch%2C%20pirate%20ship%20background%2C%20ocean%20waves%2C%20detailed%20manga%20art%20style%20with%20dynamic%20action%20and%20expressive%20features%2C%20One%20Piece%20character&width=500&height=600&seq=6&orientation=portrait'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentCharacterIndex((prevIndex) =>
                prevIndex === characters.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Username and password are required');
            return;
        }
        setLoading(true); // Set loading to true
        try {
            const formData = { email, password }; // Create the formData object
            const response = await loginUser(formData);
            console.log("Login successful:", response); // Log success response
            router.push("/hero");
        } catch (err) {
            console.error("Login error:", err); // Log the entire error object
            if (err instanceof Error) {
                setError(err.message || "Invalid email or password. Please try again.");
            } else {
                setError("Invalid email or password. Please try again.");
            }
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Left Side - Sign In Form */}
            <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <h1 className={`text-7xl font-bold text-[#ED1D24] mb-2`}>ComicPedia</h1>
                        <div className="h-1 w-32 bg-[#ED1D24] mx-auto rounded-full"></div>
                    </div>

                    <h2 className={`text-3xl font-bold mb-2 text-[#202020]`}>Sign In</h2>
                    <p className={`text-gray-600 mb-6 `}>
                        Please enter email and password to proceed!
                    </p>

                    {error && (
                        <div className="relative mb-6 p-4 bg-white border-2 border-[#ED1D24] rounded-lg" style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 85% 100%, 50% 75%, 0% 75%)" }}>
                            <p className={`text-[#ED1D24] font-bold `}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className={`block text-gray-700 mb-2 font-bold `}>
                                Email <span className="text-[#ED1D24]">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    className={`w-full text-[#ED1D24] p-3 border-2 border-gray-300 rounded-lg focus:border-[#ED1D24] focus:ring focus:ring-[#ED1D24] focus:ring-opacity-50 transition-all border-none !rounded-button `}
                                    style={{ background: "linear-gradient(to right, #fff9e5, #ffffff)", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <div className="absolute right-3 top-3 text-gray-400">
                                    <i className="fas fa-envelope"></i>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className={`block text-gray-700 mb-2 font-bold `}>
                                Password <span className="text-[#ED1D24]">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className={`w-full text-[#ED1D24] p-3 border-2 border-gray-300 rounded-lg focus:border-[#ED1D24] focus:ring focus:ring-[#ED1D24] focus:ring-opacity-50 transition-all border-none !rounded-button`}
                                    style={{ background: "linear-gradient(to right, #fff9e5, #ffffff)", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div
                                    className="absolute right-3 top-3 text-gray-400 cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="w-4 h-4 text-[#ED1D24] border-gray-300 rounded focus:ring-[#ED1D24]"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="remember" className={`ml-2 text-gray-700 `}>
                                    Remember me
                                </label>
                            </div>
                            <a
                                href="#"
                                className={`text-[#ED1D24] hover:underline font-bold `}
                            >
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className={`w-full py-3 px-4 bg-[#ED1D24] text-white font-bold rounded-lg hover:bg-[#c41a1f] transition-colors shadow-lg cursor-pointer whitespace-nowrap !rounded-button `}
                            style={{ boxShadow: "0 4px 0 #9e1519", transform: "translateY(-2px)" }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 0 #9e1519";
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 4px 0 #9e1519";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 4px 0 #9e1519";
                            }}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className={`mt-6 text-center font-bold text-[#ED1D24] `}>
                        <p>
                            Don't have an account?
                            <Link href="/signup">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Comic Character Animation */}
            <div className="w-1/2 relative overflow-hidden bg-grid bg-[#9932cc]">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage: "linear-gradient(#ff0f0f 1px, transparent 1px), linear-gradient(90deg,rgb(137, 140, 146) 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }}></div>

                {/* Characters Animation */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                    {characters.map((character, index) => (
                        <div
                            key={index}
                            className={`absolute transition-opacity duration-1000 ${index === currentCharacterIndex ? 'opacity-100' : 'opacity-0'
                                }`}
                            style={{
                                transform: index === currentCharacterIndex ? 'scale(1)' : 'scale(0.9)',
                                transition: 'transform 1s, opacity 1s'
                            }}
                        >
                            <div className="relative">
                                <div className={`absolute -top-2 -right-2 bg-[#FFD700] text-[#202020] py-1 px-3 rounded-full transform rotate-12 font-bold z-10`}>
                                    {character.name}
                                </div>
                                <div className="h-[500px] w-[400px] rounded-lg overflow-hidden border-4 border-white shadow-2xl" style={{ boxShadow: "0 0 30px rgba(237, 29, 36, 0.5)" }}>
                                    <img
                                        src={character.imageUrl}
                                        alt={character.name}
                                        className="h-full w-full object-cover object-top"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Logo and Text */}
                    <div className="absolute bottom-10 left-0 right-0 text-center text-white z-10">
                        <div className="bg-[#ED1D24] fixed top-10 right-70 inline-block px-6 py-3 rounded-lg mb-4 transform -rotate-2">
                            <h2 className={`text-3xl font-bold`}>ComicPedia</h2>
                        </div>
                        <h3 className={`text-xl mb-2 mt-8 font-bold`}>
                            Transform Wikipedia into Interactive Comics
                        </h3>
                        <p className={`max-w-md mx-auto text-sm `}>
                            Making learning more engaging and accessible for visual learners through AI-powered comic strips
                        </p>
                    </div>
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
        </div>
    );
};

export default SignInF;
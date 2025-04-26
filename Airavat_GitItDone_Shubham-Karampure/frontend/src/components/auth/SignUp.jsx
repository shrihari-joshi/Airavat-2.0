"use client"
import React, { useState, useEffect } from 'react';
const Signup = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [domain, setDomain] = useState('');
    const [educationLevel, setEducationLevel] = useState('Middle School');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
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
            name: 'Wonder Woman',
            imageUrl: 'https://readdy.ai/api/search-image?query=Wonder%20Woman%20in%20comic%20style%2C%20amazon%20warrior%2C%20golden%20lasso%2C%20heroic%20pose%2C%20paradise%20island%20background%2C%20detailed%20comic%20book%20art%20style%20with%20bold%20outlines%20and%20vibrant%20colors%2C%20DC%20superhero&width=500&height=600&seq=5&orientation=portrait'
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

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await registerUser(formData);
            setSuccess("User registered successfully!");
            setFormData({ firstName: "", lastName: "", email: "", password: "", domains: "", education_level: "middle_school" }); // Fixed 'domain' to 'domains'
            router.push("/hero");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex min-h-screen !text-red-600 bg-gray-100">
            {/* Left Side - Sign In Form */}
            <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <h1 className="text-6xl font-bold text-[#ED1D24] mb-2" style={{ fontFamily: "'Bangers', cursive" }}>ComicPedia</h1>
                        <div className="h-1 w-32 bg-[#ED1D24] mx-auto rounded-full"></div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-[#202020]" style={{ fontFamily: "'Bangers', cursive" }}>Sign Up</h2>
                    <p className="text-gray-600 mb-6" style={{ fontFamily: "'Comic Neue', cursive" }}>
                        Please fill in the following details!
                    </p>
                    {error && (
                        <div className="relative mb-6 p-4 bg-white border-2 border-[#ED1D24] rounded-lg" style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 85% 100%, 50% 75%, 0% 75%)" }}>
                            <p className="text-[#ED1D24] font-bold" style={{ fontFamily: "'Comic Neue', cursive" }}>{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="firstName" className="block text-gray-700 mb-2 font-bold" style={{ fontFamily: "'Comic Neue', cursive" }}>
                                    First Name <span className="text-[#ED1D24]">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    placeholder="Enter your first name"
                                    className="w-full p-3 font-bold border-2 border-gray-300 rounded-lg focus:border-[#ED1D24] focus:ring focus:ring-[#ED1D24] focus:ring-opacity-50 transition-all border-none !rounded-button"
                                    style={{
                                        fontFamily: "'Comic Neue', cursive",
                                        background: "linear-gradient(to right, #fff9e5, #ffffff)",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-gray-700 mb-2 font-bold" style={{ fontFamily: "'Comic Neue', cursive" }}>
                                    Last Name <span className="text-[#ED1D24]">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    placeholder="Enter your last name"
                                    className="w-full p-3 font-bold border-2 border-gray-300 rounded-lg focus:border-[#ED1D24] focus:ring focus:ring-[#ED1D24] focus:ring-opacity-50 transition-all border-none !rounded-button"
                                    style={{
                                        fontFamily: "'Comic Neue', cursive",
                                        background: "linear-gradient(to right, #fff9e5, #ffffff)",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700 mb-2 font-bold" style={{ fontFamily: "'Comic Neue', cursive" }}>
                                Email <span className="text-[#ED1D24]">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    className="w-full p-3 font-bold border-2 border-gray-300 rounded-lg focus:border-[#ED1D24] focus:ring focus:ring-[#ED1D24] focus:ring-opacity-50 transition-all border-none !rounded-button"
                                    style={{
                                        fontFamily: "'Comic Neue', cursive",
                                        background: "linear-gradient(to right, #fff9e5, #ffffff)",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <div className="absolute right-3 top-3 text-gray-400">
                                    <i className="fas fa-envelope"></i>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-gray-700 mb-2 font-bold" style={{ fontFamily: "'Comic Neue', cursive" }}>
                                Password <span className="text-[#ED1D24]">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#ED1D24] focus:ring focus:ring-[#ED1D24] focus:ring-opacity-50 transition-all border-none !rounded-button"
                                    style={{
                                        fontFamily: "'Comic Neue', cursive",
                                        background: "linear-gradient(to right, #fff9e5, #ffffff)",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}
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
                        <div className="mb-4">
                            <label htmlFor="domain" className="block text-gray-700 mb-2 font-bold" style={{ fontFamily: "'Comic Neue', cursive" }}>
                                Domain <span className="text-[#ED1D24]">*</span>
                            </label>
                            <input
                                type="text"
                                id="domain"
                                placeholder="e.g. Web Development"
                                className="w-full p-3 font-bold border-2 border-gray-300 rounded-lg focus:border-[#ED1D24] focus:ring focus:ring-[#ED1D24] focus:ring-opacity-50 transition-all border-none !rounded-button"
                                style={{
                                    fontFamily: "'Comic Neue', cursive",
                                    background: "linear-gradient(to right, #fff9e5, #ffffff)",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                }}
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="educationLevel" className="block text-gray-700 mb-2 font-bold" style={{ fontFamily: "'Comic Neue', cursive" }}>
                                Education Level
                            </label>
                            <div className="relative">
                                <select
                                    id="educationLevel"
                                    className="w-full p-3 font-bold border-2 border-gray-300 rounded-lg focus:border-[#ED1D24] focus:ring focus:ring-[#ED1D24] focus:ring-opacity-50 transition-all appearance-none border-none !rounded-button"
                                    style={{
                                        fontFamily: "'Comic Neue', cursive",
                                        background: "linear-gradient(to right, #fff9e5, #ffffff)",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}
                                    value={educationLevel}
                                    onChange={(e) => setEducationLevel(e.target.value)}
                                >
                                    <option value="Middle School">Middle School</option>
                                    <option value="High School">High School</option>
                                    <option value="College">College</option>
                                    <option value="University">University</option>
                                </select>
                                <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                                    <i className="fas fa-chevron-down"></i>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 text-2xl w-[20%] px-4 bg-[#ED1D24] text-white rounded-lg hover:bg-[#c41a1f] transition-colors shadow-lg cursor-pointer whitespace-nowrap !rounded-button"
                            style={{
                                fontFamily: "'Bangers', cursive",
                                boxShadow: "0 4px 0 #9e1519",
                                transform: "translateY(-2px)"
                            }}
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
                            Sign Up
                        </button>
                    </form>
                    <div className="mt-6 font-bold text-center">
                        <p style={{ fontFamily: "'Comic Neue', cursive" }}>
                            Already have an account?
                            <a href="/signin" className="text-[#ED1D24] font-bold ml-1 hover:underline" style={{ fontFamily: "'Comic Neue', cursive" }}>
                                Sign In
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            {/* Right Side - Comic Character Animation */}
            <div className="w-1/2 relative overflow-hidden bg-[#9932cc]">
                {/* Grid Background */}
                <div className="absolute inset-0 bg-grid opacity-20" style={{
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
                                <div className="absolute -top-2 -right-2 bg-[#FFD700] text-[#202020] py-1 px-3 rounded-full transform rotate-12 font-bold z-10" style={{ fontFamily: "'Bangers', cursive" }}>
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
                    <div className="absolute top-12 left-0 right-0 text-center text-white z-10">
                        <div className="bg-[#ED1D24] inline-block px-6 py-3 rounded-lg mb-4 transform -rotate-2">
                            <h2 className="text-3xl font-bold " style={{ fontFamily: "'Bangers', cursive" }}>ComicPedia</h2>
                        </div>
                        <h3 className="text-xl mb-2 font-bold" style={{ fontFamily: "'Bangers', cursive" }}>
                            Transform Wikipedia into Interactive Comics
                        </h3>
                        <p className="max-w-md mx-auto text-sm" style={{ fontFamily: "'Comic Neue', cursive" }}>
                            Making learning more engaging and accessible for visual learners through AI-powered comic strips
                        </p>
                    </div>
                </div>
            </div>
            {/* Font imports */}
            <style jsx>{`
@import url('https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&display=swap');
`}</style>
        </div>
    );
};
export default Signup

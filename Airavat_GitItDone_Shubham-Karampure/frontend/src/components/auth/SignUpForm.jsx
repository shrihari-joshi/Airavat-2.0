"use client";
import React, { useState, useEffect } from 'react';
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { registerUser } from "@/api/authApi.js";
import { useRouter } from 'next/navigation';

export default function SignUpForm() {

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        domains: "",
        education_level: "middle_school",
    });
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

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
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
        <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md sm:pt-10 mx-auto mb-5 ">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Sign Up
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Please fill in the following details!
                        </p>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    {/* ... First Name and Last Name inputs ... */}
                                    <div>
                                        <Label>First Name<span className="text-error-500">*</span></Label>
                                        <Input type="text" name="firstName" placeholder="Enter your first name" value={formData.firstName} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <Label>Last Name<span className="text-error-500">*</span></Label>
                                        <Input type="text" name="lastName" placeholder="Enter your last name" value={formData.lastName} onChange={handleChange} />
                                    </div>
                                </div>

                                {/* ... Email and Password inputs ... */}
                                <div>
                                    <Label>Email<span className="text-error-500">*</span></Label>
                                    <Input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
                                </div>

                                <div>
                                    <Label>Password<span className="text-error-500">*</span></Label>
                                    <div className="relative">
                                        <Input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} />
                                        <span onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer">
                                            {showPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <Label>
                                            Domain<span className="text-error-500">*</span>
                                        </Label>
                                        <Input
                                            type="text"
                                            name="domains"
                                            placeholder="e.g. Web Development"
                                            value={formData.domains}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Education Level</Label>
                                    <select
                                        name="education_level"
                                        value={formData.education_level}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    >
                                        <option value="middle_school">Middle School</option>
                                        <option value="high_school">High School</option>
                                        <option value="bachelor">Bachelor's Degree</option>
                                        <option value="master">Master's Degree</option>
                                        <option value="phd">PhD</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <button type="submit" className="w-full px-4 py-3 text-white bg-brand-500 rounded-lg shadow-md hover:bg-brand-600" disabled={loading}>
                                        {loading ? "Signing Up..." : "Sign Up"}
                                    </button>
                                </div>

                                {error && <p className="text-red-500">{error}</p>}
                                {success && <p className="text-green-500">{success}</p>}
                            </div>
                        </form>

                        <div className="mt-5">
                            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                                Already have an account?
                                <Link
                                    href="/signin"
                                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
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
}
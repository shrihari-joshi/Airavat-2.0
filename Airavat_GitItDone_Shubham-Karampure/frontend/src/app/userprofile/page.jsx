"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/api/authApi';


const userprofile = () => {
    const [firstName, setFirstName] = useState('Peter');
    const [lastName, setLastName] = useState('Parker');
    const [age, setAge] = useState(25);
    const [email, setEmail] = useState('spidey@marvel.com');
    const [domain, setDomain] = useState('Photography');
    const [interests, setInterests] = useState(['Web-slinging', 'Science', 'Photography']);
    const [newInterest, setNewInterest] = useState('');
    const [expandedSections, setExpandedSections] = useState({
        personal: true,
        interests: true
    });
    const router = useRouter();

    const handleLogout = async () => {
        alert('Logging out... KAPOW!');
        try {
            await logoutUser();
            router.push('/signin');
        } catch (error) {
            console.error('Logout failed:', error);
            // optionally show toast or alert
        }
    };
    const handleAddInterest = () => {
        if (newInterest.trim() !== '' && !interests.includes(newInterest.trim())) {
            setInterests([...interests, newInterest.trim()]);
            setNewInterest('');
        }
    };
    const handleRemoveInterest = (index) => {
        const updatedInterests = [...interests];
        updatedInterests.splice(index, 1);
        setInterests(updatedInterests);
    };

    const toggleSection = (section) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section],
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans" >
            <div className="min-h-screen bg-black backdrop-blur-sm">
                {/* Header with Hero Banner */}
                <header className="relative w-full h-92 overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="https://readdy.ai/api/search-image?query=marvel%20cinematic%20universe%20style%20cityscape%20with%20avengers%20tower%2C%20thor%20lightning%20in%20sky%2C%20iron%20man%20flying%2C%20spiderman%20swinging%2C%20epic%20dramatic%20composition%2C%20movie%20poster%20quality%2C%20photorealistic%20render&width=1440&height=300&seq=hero2&orientation=landscape"
                            alt="Hero Banner"
                            className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
                    </div>
                    {/* Logout Button */}
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-button transform hover:scale-105 transition-transform duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-lg border-2 border-white"
                        >
                            <i className="fas fa-power-off"></i>
                            LOGOUT!
                        </button>
                    </div>
                </header>
                {/* Profile Section */}
                <div className="max-w-5xl mx-auto px-4 -mt-20 absolute top-60 left-60 z-10">
                    <div className=" rounded-lg shadow-xl overflow-hidden mb-8">
                        {/* Profile Header */}
                        <div
                            className="flex flex-col md:flex-row items-center p-6 border-b-4 border-yellow-400"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }} // White with 50% opacity
                        >
                            <div className="relative  mb-4 md:mb-0 md:mr-6">
                                <div className="w-32 h-32 bg-blue-500 rounded-full overflow-hidden border-4 border-red-500 shadow-lg">
                                    <img
                                        src="https://readdy.ai/api/search-image?query=spiderman%20peter%20parker%20portrait%20in%20marvel%20cinematic%20universe%20style%2C%20wearing%20iconic%20red%20and%20blue%20suit%2C%20mask%20partially%20lifted%2C%20photorealistic%20detailed%20face%2C%20dramatic%20lighting%2C%20professional%20photography&width=200&height=200&seq=avatar2&orientation=squarish"
                                        alt="Profile Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full transform rotate-12 shadow">
                                    HERO!
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-extrabold text-white-800 tracking-wider" >
                                    {firstName} {lastName}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-lg text-sm font-semibold">
                                        <i className="fas fa-briefcase mr-1"></i> {domain}
                                    </span>
                                </p>
                            </div>
                        </div>
                        {/* Personal Information Section */}
                        <div className="p-6 bg-blue-50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                            <div className="flex items-center justify-between mb-4">

                                <button
                                    onClick={() => toggleSection('personal')}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-1 px-3 rounded-button cursor-pointer whitespace-nowrap"
                                >
                                    {expandedSections.personal ? (
                                        <i className="fas fa-chevron-up"></i>
                                    ) : (
                                        <i className="fas fa-chevron-down"></i>
                                    )}
                                </button>
                            </div>
                            {expandedSections.personal && (
                                <div className="flex flex-col md:flex-row gap-6 animate__animated animate__fadeIn">
                                    {/* LEFT SIDE */}
                                    <div className="flex-1 space-y-4">
                                        {/* First + Last Name Row */}
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1 bg-white p-4 rounded-lg border-2 border-red-300 shadow-md">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    <i className="fas fa-id-card mr-1"></i> First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    className="w-full p-2 border-2 border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800"
                                                />
                                            </div>
                                            <div className="flex-1 bg-white p-4 rounded-lg border-2 border-red-300 shadow-md">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    <i className="fas fa-id-card mr-1"></i> Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    className="w-full p-2 border-2 border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800"
                                                />
                                            </div>
                                        </div>

                                        {/* Age + Email Row */}
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1 bg-white p-4 rounded-lg border-2 border-red-300 shadow-md">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    <i className="fas fa-birthday-cake mr-1"></i> Age
                                                </label>
                                                <input
                                                    type="number"
                                                    value={age}
                                                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                                                    className="w-full p-2 border-2 border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                            </div>
                                            <div className="flex-1 bg-white p-4 rounded-lg border-2 border-red-300 shadow-md">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    <i className="fas fa-envelope mr-1"></i> Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full p-2 border-2 border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800"
                                                />
                                            </div>

                                        </div>
                                        <div className="bg-white p-4 rounded-lg border-2 border-red-300 shadow-md">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                <i className="fas fa-briefcase mr-1"></i> Domain
                                            </label>
                                            <input
                                                type="text"
                                                value={domain}
                                                onChange={(e) => setDomain(e.target.value)}
                                                className="w-full p-2 border-2 border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-blue-500 text-gray-800"
                                            />
                                        </div>
                                    </div>

                                    {/* RIGHT SIDE */}
                                    <div className="flex-1 space-y-4">


                                        {/* You can optionally move the Interests section here if desired */}
                                        <div className="p-6 bg-red-50 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-2xl font-bold text-red-800">
                                                    <i className="fas fa-heart mr-2"></i> Interests
                                                </h2>
                                                <button
                                                    onClick={() => toggleSection('interests')}
                                                    className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-1 px-3 rounded-button cursor-pointer whitespace-nowrap"
                                                >
                                                    {expandedSections.interests ? (
                                                        <i className="fas fa-chevron-up"></i>
                                                    ) : (
                                                        <i className="fas fa-chevron-down"></i>
                                                    )}
                                                </button>
                                            </div>
                                            {expandedSections.interests && (
                                                <div className="animate__animated animate__fadeIn">
                                                    <div className="bg-white p-4 rounded-lg border-2 border-red-300 shadow-md mb-4">
                                                        <div className="flex items-center">
                                                            <input
                                                                type="text"
                                                                value={newInterest}
                                                                onChange={(e) => setNewInterest(e.target.value)}
                                                                placeholder="Add new interest..."
                                                                className="flex-grow p-2 border-2 border-red-300 rounded-l focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800"
                                                            />
                                                            <button
                                                                onClick={handleAddInterest}
                                                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-r border-2 border-red-600 hover:border-red-700 cursor-pointer whitespace-nowrap"
                                                            >
                                                                <i className="fas fa-plus"></i> +
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3">
                                                        {interests.map((interest, index) => (
                                                            <div
                                                                key={index}
                                                                className="bg-white px-3 py-2 rounded-full border-2 border-red-300 shadow-md flex items-center group hover:bg-red-100 transition-colors duration-200"
                                                            >
                                                                <span className="text-gray-800 font-semibold">{interest}</span>
                                                                <button
                                                                    onClick={() => handleRemoveInterest(index)}
                                                                    className="ml-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs hover:bg-red-700 transition-colors duration-200 cursor-pointer"
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {interests.length === 0 && (
                                                            <div className="text-gray-500 italic">No interests added yet. Add some!</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Save Button */}
                        <div className="p-6 bg-gray-100 border-t-4 border-yellow-400 flex justify-end" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-button transform hover:scale-105 transition-transform duration-200 cursor-pointer whitespace-nowrap">
                                <i className="fas fa-save mr-2"></i> SAVE PROFILE!
                            </button>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};
export default userprofile

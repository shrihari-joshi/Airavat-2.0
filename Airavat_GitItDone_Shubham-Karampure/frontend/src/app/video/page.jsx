"use client"
import React, { useState } from 'react';

const video = () => {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const reels = [
        {
            id: 1,
            title: "Spider-Man's Ultimate Web Swing",
            character: "Spider-Man",
            views: "2.4M",
            duration: "0:45",
            thumbnail: "https://readdy.ai/api/search-image?query=Spider-Man%20swinging%20through%20New%20York%20City%20with%20dynamic%20pose%2C%20comic%20book%20style%2C%20vibrant%20colors%2C%20action%20scene%2C%20detailed%20cityscape%20background%2C%20Marvel%20universe%2C%20heroic%20composition%2C%20dramatic%20lighting&width=400&height=225&seq=1&orientation=landscape"
        },
        {
            id: 2,
            title: "Thor's Lightning Strike",
            character: "Thor",
            views: "1.8M",
            duration: "0:32",
            thumbnail: "https://readdy.ai/api/search-image?query=Thor%20wielding%20Mjolnir%20with%20lightning%20effects%2C%20comic%20book%20style%2C%20dramatic%20storm%20clouds%2C%20Asgardian%20armor%2C%20cape%20flowing%2C%20powerful%20stance%2C%20Marvel%20universe%2C%20mythical%20background%2C%20action%20scene%20with%20lightning&width=400&height=225&seq=2&orientation=landscape"
        },
        {
            id: 3,
            title: "Iron Man Suit Up Sequence",
            character: "Iron Man",
            views: "3.2M",
            duration: "0:28",
            thumbnail: "https://readdy.ai/api/search-image?query=Iron%20Man%20suit%20assembly%20sequence%2C%20Tony%20Stark%20with%20high-tech%20holographic%20interface%2C%20comic%20book%20style%2C%20red%20and%20gold%20armor%2C%20futuristic%20workshop%2C%20Marvel%20universe%2C%20mechanical%20details%2C%20glowing%20reactor%2C%20technological%20background&width=400&height=225&seq=3&orientation=landscape"
        },
        {
            id: 4,
            title: "Captain America Shield Throw",
            character: "Captain America",
            views: "1.5M",
            duration: "0:38",
            thumbnail: "https://readdy.ai/api/search-image?query=Captain%20America%20throwing%20shield%20with%20perfect%20trajectory%2C%20comic%20book%20style%2C%20action%20scene%2C%20patriotic%20colors%2C%20determined%20expression%2C%20World%20War%20II%20backdrop%2C%20Marvel%20universe%2C%20dynamic%20pose%2C%20shield%20with%20star%20emblem%20prominent&width=400&height=225&seq=4&orientation=landscape"
        },
        {
            id: 5,
            title: "Hulk Smash Compilation",
            character: "Hulk",
            views: "2.7M",
            duration: "0:52",
            thumbnail: "https://readdy.ai/api/search-image?query=Hulk%20smashing%20through%20concrete%20walls%2C%20comic%20book%20style%2C%20incredible%20strength%20display%2C%20green%20muscular%20figure%2C%20angry%20expression%2C%20dust%20and%20debris%20flying%2C%20Marvel%20universe%2C%20destructive%20power%2C%20urban%20setting%20with%20destruction&width=400&height=225&seq=5&orientation=landscape"
        },
        {
            id: 6,
            title: "Black Widow Combat Skills",
            character: "Black Widow",
            views: "1.9M",
            duration: "0:41",
            thumbnail: "https://readdy.ai/api/search-image?query=Black%20Widow%20performing%20acrobatic%20combat%20moves%2C%20comic%20book%20style%2C%20sleek%20black%20outfit%2C%20red%20hair%2C%20martial%20arts%20sequence%2C%20spy%20aesthetic%2C%20Marvel%20universe%2C%20action%20scene%20with%20multiple%20opponents%2C%20dramatic%20lighting%2C%20urban%20setting&width=400&height=225&seq=6&orientation=landscape"
        }
    ];

    const currentReel = reels[currentVideoIndex];

    const handleVideoChange = (index) => {
        setCurrentVideoIndex(index);
        setIsPlaying(true);
        setIsLiked(false);
        setIsDisliked(false);
    };

    const toggleLike = () => {
        setIsLiked(!isLiked);
        if (isDisliked) setIsDisliked(false);
    };

    const toggleDislike = () => {
        setIsDisliked(!isDisliked);
        if (isLiked) setIsLiked(false);
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    return (
        <div className="min-h-screen bg-gray-100 text-white" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif" }}>
            {/* Marvel-themed Header */}
            <header className="bg-gradient-to-r from-purple-600 to-purple-800 py-4 px-6 flex justify-between items-center shadow-lg">
                <div className="flex items-center">
                    <h1 className="text-6xl tracking-wider text-white" style={{ textShadow: '2px 2px 0 #000' }}>
                        INFOCOMIC REELS
                    </h1>
                </div>

            </header>

            {/* Main Content */}
            <main className="flex flex-col md:flex-row p-4 mt-9 max-w-screen-2xl mx-auto">
                {/* Left Section - Current Playing Reel (60%) */}
                <div className="w-full md:w-3/5 md:pr-4 mb-6 md:mb-0">
                    <div className="bg-gray-800 rounded-xl overflow-hidden relative h-[calc(100vh-12rem)] shadow-2xl border-4 border-yellow-500">
                        {/* Video Player */}
                        <div className="relative w-full h-full bg-black">
                            <img
                                src={currentReel.thumbnail}
                                alt={currentReel.title}
                                className="w-full h-full object-cover"
                            />

                            {/* Video Controls Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="text-xl font-bold">{currentReel.title}</h3>
                                        <p className="text-gray-300">{currentReel.character}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-gray-300 mr-2"><i className="fas fa-eye mr-1"></i> {currentReel.views}</span>
                                        <span className="text-gray-300"><i className="fas fa-clock mr-1"></i> {currentReel.duration}</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-gradient-to-r from-red-600 to-blue-600 h-full rounded-full" style={{ width: '45%' }}></div>
                                </div>

                                {/* Play Controls */}
                                <div className="flex items-center justify-center mt-3 space-x-6">
                                    <button className="text-2xl hover:text-red-500 transition cursor-pointer">
                                        <i className="fas fa-step-backward"></i>
                                    </button>
                                    <button
                                        className="text-3xl hover:text-red-500 transition cursor-pointer"
                                        onClick={() => setIsPlaying(!isPlaying)}
                                    >
                                        <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                                    </button>
                                    <button className="text-2xl hover:text-red-500 transition cursor-pointer">
                                        <i className="fas fa-step-forward"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Interaction Buttons Column */}
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-6">
                                {/* Shield / Like */}
                                <button
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${isLiked ? 'bg-blue-600 text-white' : 'bg-gray-800/70 text-gray-200 hover:bg-gray-700/80'}`}
                                    onClick={toggleLike}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </button>

                                {/* Hand Rock / Dislike */}
                                <button
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${isDisliked ? 'bg-purple-600 text-white' : 'bg-gray-800/70 text-gray-200 hover:bg-gray-700/80'}`}
                                    onClick={toggleDislike}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M7 10v12m10-12v12M5 10h14l-1-7H6L5 10zm3 0v12h8V10" />
                                    </svg>
                                </button>

                                {/* Comment */}
                                <button
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${showComments ? 'bg-yellow-600 text-white' : 'bg-gray-800/70 text-gray-200 hover:bg-gray-700/80'}`}
                                    onClick={toggleComments}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                    </svg>
                                </button>

                                {/* Share */}
                                <button className="w-12 h-12 rounded-full bg-gray-800/70 text-gray-200 flex items-center justify-center hover:bg-gray-700/80 transition-all cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M4 12v-1a3 3 0 013-3h10a3 3 0 013 3v1M12 16l4-4m0 0l-4-4m4 4H8" />
                                    </svg>
                                </button>

                                {/* More (Ellipsis) */}
                                <button className="w-12 h-12 rounded-full bg-gray-800/70 text-gray-200 flex items-center justify-center hover:bg-gray-700/80 transition-all cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="5" cy="12" r="2" />
                                        <circle cx="12" cy="12" r="2" />
                                        <circle cx="19" cy="12" r="2" />
                                    </svg>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Right Section - Reel Cards (40%) */}
                <div className="w-full md:w-2/5 md:pl-4">
                    <div className="bg-white text-red-700 rounded-xl p-4 h-[calc(100vh-12rem)] overflow-y-auto shadow-xl border-4 border-blue-600">
                        <h2 className="text-2xl mb-4 text-center" style={{ textShadow: '1px 1px 0 red' }}>
                            TRENDING REELS
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            {reels.map((reel, index) => (
                                <div
                                    key={reel.id}
                                    className={`bg-gray-700 rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 cursor-pointer ${currentVideoIndex === index ? 'ring-4 ring-red-500' : ''}`}
                                    onClick={() => handleVideoChange(index)}
                                >
                                    <div className="relative">
                                        <img
                                            src={reel.thumbnail}
                                            alt={reel.title}
                                            className="w-full h-32 object-cover"
                                        />
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                                            {reel.duration}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <i className="fas fa-play-circle text-4xl text-white"></i>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <h3 className="font-bold text-sm line-clamp-1">{reel.title}</h3>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-gray-300">{reel.character}</span>
                                            <span className="text-xs text-gray-300"><i className="fas fa-eye mr-1"></i>{reel.views}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <h3 className="text-2xl text-red-700 font-bold mb-3" style={{ textShadow: '1px 1px 0 red' }}>SUGGESTED FOR YOU</h3>
                            <div className="space-y-3">
                                {[...reels].reverse().slice(0, 3).map((reel) => (
                                    <div key={`suggested-${reel.id}`} className="flex bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition cursor-pointer">
                                        <img
                                            src={reel.thumbnail}
                                            alt={reel.title}
                                            className="w-24 h-16 object-cover"
                                        />
                                        <div className="p-2 flex-1">
                                            <h4 className="font-bold text-sm line-clamp-1">{reel.title}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-gray-300">{reel.character}</span>
                                                <span className="text-xs text-gray-300">{reel.views}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>


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

export default video;


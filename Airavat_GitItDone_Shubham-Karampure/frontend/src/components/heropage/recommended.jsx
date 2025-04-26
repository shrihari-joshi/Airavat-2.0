import React from 'react'

const Recommended = () => {


    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-blue-300" style={{ borderStyle: 'solid' }}>
            <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold text-purple-800 transform -rotate-1"> <span className="bg-blue-400 text-white px-2 py-1 inline-block">Recommended Topics</span> </h2>
                <div className="ml-2"> <i className="fas fa-thumbs-up text-blue-500"></i>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <p className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold transform hover:scale-105 transition duration-200 cursor-pointer !rounded-button whitespace-nowrap"> AI Education </p>
                <p className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold transform hover:scale-105 transition duration-200 cursor-pointer !rounded-button whitespace-nowrap"> Visual Learning </p>
                <p className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold transform hover:scale-105 transition duration-200 cursor-pointer !rounded-button whitespace-nowrap"> Educational Comics </p>
                <p className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold transform hover:scale-105 transition duration-200 cursor-pointer !rounded-button whitespace-nowrap"> Digital Storytelling </p>
                <p className="bg-yellow-500 text-purple-900 px-3 py-1 rounded-full text-sm font-bold transform hover:scale-105 transition duration-200 cursor-pointer !rounded-button whitespace-nowrap"> Manga Style </p>
                <p className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold transform hover:scale-105 transition duration-200 cursor-pointer !rounded-button whitespace-nowrap"> Western Comics </p>
                <p className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold transform hover:scale-105 transition duration-200 cursor-pointer !rounded-button whitespace-nowrap"> Educational Technology </p>
                <p className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold transform hover:scale-105 transition duration-200 cursor-pointer !rounded-button whitespace-nowrap"> Inclusive Design </p>
            </div>
        </div>
    )
}

export default Recommended
import React from 'react'

const Trending = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-purple-300" style={{ borderStyle: 'dashed' }}>

            <div className="flex items-center mb-4">
                <h2 className="text-2xl text-purple-800 transform -rotate-1">
                    <span className="bg-red-400 text-white px-2 py-1 inline-block">Trending Blogs</span>
                </h2>
                <div className="ml-2"> <i className="fas fa-fire text-red-500"></i>
                </div>
            </div>
            <ul className="space-y-4">
                <li className="pb-3 border-b border-gray-200 border-dashed">
                    <a href="#" className="block hover:bg-purple-50 p-2 rounded transition duration-200">
                        <h3 className="text-purple-700">AI in Education: 2025 Trends</h3>
                        <p className="text-sm text-gray-600">By Maria Chen</p>
                    </a>
                </li>
                <li className="pb-3 border-b border-gray-200 border-dashed">
                    <a href="#" className="block hover:bg-purple-50 p-2 rounded transition duration-200">
                        <h3 className="text-purple-700">Visual Learning for STEM Subjects</h3>
                        <p className="text-sm text-gray-600">By David Wong</p>
                    </a>
                </li>
                <li className="pb-3 border-b border-gray-200 border-dashed">
                    <a href="#" className="block hover:bg-purple-50 p-2 rounded transition duration-200">
                        <h3 className="text-purple-700">Comics as Educational Tools</h3> <p className="text-sm text-gray-600">By Sarah Johnson</p>
                    </a>
                </li>
                <li>
                    <a href="#" className="block hover:bg-purple-50 p-2 rounded transition duration-200">
                        <h3 className="text-purple-700">Inclusive Design in Educational Media</h3>
                        <p className="text-sm text-gray-600">By James Rodriguez</p> </a>
                </li>
            </ul>
        </div>
    )
}

export default Trending
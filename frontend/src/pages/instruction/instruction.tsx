import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { testService } from '../../services/test.service';
import { AlertTriangle, ClipboardCheck, Clock, Code } from 'lucide-react';
import { message } from 'antd';

const Instruction: React.FC = () => {
    const [candidateDetails, setCandidateDetails] = useState({
        name: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate()

    useEffect(() => {
        localStorage.removeItem('access')
    }, [])

    const startTest = async () => {

        if (!candidateDetails.name.trim() || !candidateDetails.email.trim() || !candidateDetails.password.trim()) {
            alert("Please enter your name before starting the test");
            return;
        }

        const response = await testService.validateCandidate(candidateDetails)

        if (response.error)
            message.error('Failed to start test with your credentials')
        else {
            localStorage.setItem('candidateDetail', JSON.stringify(candidateDetails))
            localStorage.setItem('access', response.access);
            localStorage.setItem('refresh', response.refresh);
            if (candidateDetails.email == 'cosgrid@gmail.com')
                navigate('/create-question')
            else
                navigate('/questionaries')
        }


    }

    const handleDetails = (key: string, value: string) => {
        setCandidateDetails((prev) => ({
            ...prev,
            [key]: value
        }))
    }
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left side - might contain logo or illustration */}
            <div className="hidden lg:flex lg:flex-1 bg-gradient-to-b from-blue-700 to-blue-500 items-center justify-center h-screen">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-10 flex flex-col items-center text-white max-w-sm w-full mx-6">
                    <img
                        src="https://vcdn.cosgrid.com/COSGridNet/common/cosgrid-logo.png"
                        alt="Company Logo"
                        className="h-20 w-auto object-contain mb-6"
                    />
                    <Code size={80} className="text-white mb-4" />
                    <h1 className="text-4xl font-extrabold text-center leading-tight">
                        Coding Assessment
                    </h1>
                    <p className="text-lg text-blue-100 mt-4 text-center">
                        Show us your skills!
                    </p>
                </div>
            </div>

            {/* Right side - instructions */}
            <div className="flex-1 flex flex-col px-8 py-16 overflow-y-auto">
                <div className="max-w-xl mx-auto w-full">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Test Instructions</h2>
                        <p className="text-gray-600">Please read carefully before proceeding</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <ul className="space-y-4">
                            <li className="flex items-center ">
                                <div className="bg-blue-100 p-2 rounded-full mr-4 mt-1">
                                    <ClipboardCheck size={20} className="text-blue-600" />
                                </div>
                                <span>You need to attend <strong className="text-blue-600">all the questions</strong>.</span>
                            </li>
                            {/* <li className="flex items-center">
                                <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
                                    <Code size={20} className="text-green-600" />
                                </div>
                                <span>You can <strong className="text-green-600">run your code</strong> as many times as you want.</span>
                            </li> */}
                            <li className="flex items-center">
                                <div className="bg-red-100 p-2 rounded-full mr-4 mt-1">
                                    <AlertTriangle size={20} className="text-red-600" />
                                </div>
                                <span>After submission, <strong className="text-red-600">you cannot modify</strong> your code.</span>
                            </li>
                            <li className="flex items-center">
                                <div className="bg-orange-100 p-2 rounded-full mr-4 mt-1">
                                    <AlertTriangle size={20} className="text-orange-600" />
                                </div>
                                <span><strong className="text-orange-600">Copy-pasting</strong> is disabled in the code editor.</span>
                            </li>
                            <li className="flex items-center">
                                <div className="bg-purple-100 p-2 rounded-full mr-4 mt-1">
                                    <AlertTriangle size={20} className="text-purple-600" />
                                </div>
                                <span>If you switch tabs or windows more than <strong className="text-purple-600">3 times</strong>, your test will be terminated.</span>
                            </li>
                            <li className="flex items-center">
                                <div className="bg-yellow-100 p-2 rounded-full mr-4 mt-1">
                                    <Clock size={20} className="text-yellow-600" />
                                </div>
                                <span>The timer will <strong className="text-yellow-600">start after you click "Start Test"</strong>.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                            Enter your name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={candidateDetails.name}
                            onChange={(e) => handleDetails('name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your name"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                            Enter your Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={candidateDetails.email}
                            onChange={(e) => handleDetails('email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="example@gmail.com"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                            Enter your Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={candidateDetails.password}
                            onChange={(e) => handleDetails('password', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="xxxxxxxx"
                        />
                    </div>

                    <button
                        onClick={startTest}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center cursor-pointer"
                    >
                        <span className="mr-2">Start Test</span>
                        <Code size={20} />
                    </button>

                    <p className="text-gray-500 text-sm mt-4 text-center">
                        Good luck with your assessment!
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Instruction


import { XCircle, AlertTriangle, Clock, Trophy, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { testService } from '../../services/test.service';
import { message } from 'antd';
import { authService } from '../../services/auth.service';



export const TestEnd: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation();
    const [submitted, setSubmitted] = useState<boolean>(false)
    const { status, globalTimeElapsed } = location.state;
    const minutes = Math.floor(globalTimeElapsed / 60);
    const seconds = globalTimeElapsed % 60;


    useEffect(() => {
        uploadPDF()
        localStorage.removeItem('testStartTime');
    }, [])

    const uploadPDF = async () => {
        const response = await testService.submitPDF(globalTimeElapsed)
        if (response.error)
            message.error("Failed to submit your data")
        else
            setSubmitted(true)
    }

    const handleCloseTest = async () => {
        console.log('htgrfedcxws')
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
            await authService.logout(refreshToken); // This must call /api/logout/
        }
        //await authService.deleteUser();
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/');
    };
    
    
    if (status === 'canditate-violated') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
                    <div className="bg-red-600 p-5 text-center">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                            <XCircle size={40} className="text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Test Terminated</h2>
                    </div>

                    <div className="p-6">
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <div className="flex">
                                <AlertTriangle className="text-red-500 mr-3 flex-shrink-0" />
                                <p className="text-red-700">
                                    You switched tabs or lost focus too many times. Your session has been closed due to violation of test rules.
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Please contact the test administrator if you believe this was an error.
                        </p>

                        <button
                            className="w-full bg-red-100 hover:bg-red-200 text-red-600 font-medium py-3 px-4 rounded-md transition duration-200"
                            onClick={handleCloseTest}
                        >
                            Close Test
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Time's up screen
    if (status === 'time-finished') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
                    <div className="bg-amber-600 p-5 text-center">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                            <Clock size={40} className="text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Time's Up!</h2>
                    </div>

                    <div className="p-6">
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
                            <div className="flex">
                                <AlertTriangle className="text-amber-500 mr-3 flex-shrink-0" />
                                <p className="text-amber-700">
                                    The allotted time for this assessment has ended. Your answers have been automatically submitted.
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Thank you for completing the assessment. Your results will be processed shortly.
                        </p>

                        <button
                            className="w-full bg-amber-100 hover:bg-amber-200 text-amber-600 font-medium py-3 px-4 rounded-md transition duration-200"
                            onClick={handleCloseTest}
                        >
                            Close Test
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Successful completion screen
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
                <div className="bg-green-600 p-5 text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <Trophy size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Assessment Completed</h2>
                </div>

                <div className="p-6">
                    <div className="flex flex-col space-y-6">
                        {/* Score card */}
                        {/* <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-2 rounded-full mr-3">
                                    <Trophy size={24} className="text-blue-600" />
                                </div>
                                <span className="text-gray-700 font-medium">Final Score</span>
                            </div>
                            <div className="text-xl font-bold text-blue-600">
                                {score}/{total}
                                <span className="text-sm text-gray-500 font-normal ml-2">questions</span>
                            </div>
                        </div> */}

                        {/* Time card */}
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-2 rounded-full mr-3">
                                    <Clock size={24} className="text-purple-600" />
                                </div>
                                <span className="text-gray-700 font-medium">Time Taken</span>
                            </div>
                            <div className="text-xl font-bold text-purple-600">
                                {minutes}<span className="text-sm text-gray-500 font-normal ml-1">min</span> {seconds}<span className="text-sm text-gray-500 font-normal ml-1">sec</span>
                            </div>
                        </div>

                        {/* Success message */}
                        <div className="bg-green-50 border-l-4 border-green-500 p-4">
                            <div className="flex">
                                <Check className="text-green-500 mr-3 flex-shrink-0" />
                                <p className="text-green-700">
                                    {submitted ? 'Your code has been successfully submitted. You may now close this window.' : 'Don\'t close the window, We are submitting your data'}
                                </p>
                            </div>
                        </div>

                        {/* Submit button (shown conditionally) */}
                        {/* {false && (
                            <button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
                            >
                                <Send size={18} className="mr-2" />
                                Submit Codes
                            </button>
                        )} */}

                        {/* Close button */}
                        <button
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-md transition duration-200"
                            onClick={handleCloseTest}
                        // disabled={!submitted}
                        >
                            Close Test
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

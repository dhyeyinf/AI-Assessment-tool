import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingScreen({ message = "Loading your test environment..." }) {
    const loadingMessages = [
        "Configuring test environment...",
        "Preparing questions...",
        "Setting up code editor...",
        "Loading test cases...",
        "Almost ready..."
    ];

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // Cycle through loading messages
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prevIndex) =>
                prevIndex === loadingMessages.length - 1 ? 0 : prevIndex + 1
            );
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
                {/* Animated loader */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-t-4 border-b-4 border-blue-600 animate-spin"></div>
                        <Loader2 size={32} className="text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                </div>

                {/* Loading message */}
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Preparing Your Test</h2>
                <p className="text-gray-600 mb-6">{message}</p>

                {/* Loading progress bar */}
                {/* <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
                        <div className="w-4/5 bg-blue-600 h-2 rounded-full animate-pulse"></div>
                    </div> */}

                {/* Tips section */}
                <div className="bg-blue-50 rounded-lg p-4 text-left">
                    <h3 className="font-medium text-blue-800 mb-2">Quick Tips:</h3>
                    <ul className="text-blue-700 text-sm space-y-2">
                        <li>• Read each question carefully before starting to code</li>
                        <li>• You can run your code multiple times before submitting</li>
                        <li>• Remember to test edge cases</li>
                    </ul>
                </div>
            </div>

            {/* Loading messages that cycle */}
            <div className="mt-8 text-gray-500 text-sm animate-pulse">
                {loadingMessages[currentMessageIndex]}
            </div>
        </div>
    );
}
import React, { useEffect, useState } from 'react'
import { testService } from '../../services/test.service';
import { message } from 'antd';
import CodeEditor from '../../components/CodeEditor';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, ChevronRight, Clock, XCircle, Loader } from 'lucide-react';
import LoadingScreen from '../../components/Loading';
import Navbar from '../../components/Navbar';

const Questionaries: React.FC = () => {
    const [hasStarted, setHasStarted] = useState(false);
    const [questionIndex, setQuestionIndex] = useState(1);
    const [questionData, setQuestionData] = useState<any>(null);
    const [submitLoading, SetSubmitLoading] = useState<boolean>(false)
    const [totalQuestions, SetTotalQuestions] = useState<number>(0)
    const [code, setCode] = useState("");
    const [feedback, setFeedback] = useState("");
    const [questionTimeElapsed, setQuestionTimeElapsed] = useState(0);
    const [loading, setLoading] = useState<boolean>(true)
    const [runResults, setRunResults] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [submittedMessage, setSubmittedMessage] = useState("");
    const [violationCount, setViolationCount] = useState(0);
    const [globalTimeElapsed, setGlobalTimeElapsed] = useState(0);
    const maxDuration = 1200; // 20 minutes

    const navigate = useNavigate()

    // ⚠️ Detect tab switch or browser switch and start the test
    useEffect(() => {
        const handleViolation = () => {
            setViolationCount(prev => {
                const updated = prev + 1;
                if (updated >= 4) navigate('/done', { state: { status: 'canditate-violated' } });
                return updated;
            });
        };

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) handleViolation();
        });
        window.addEventListener("blur", handleViolation);

        startTest()


        return () => {
            document.removeEventListener("visibilitychange", handleViolation);
            window.removeEventListener("blur", handleViolation);
        };
    }, []);

    useEffect(() => {
        if (!hasStarted || submitted) return;
        const interval = setInterval(() => {
            setQuestionTimeElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [hasStarted, submitted, questionIndex]);
    

    useEffect(() => {
        const storedStartTime = localStorage.getItem('testStartTime');
        if (storedStartTime) {
            const startTime = parseInt(storedStartTime, 10);
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            if (elapsed < maxDuration) {
                setGlobalTimeElapsed(elapsed);
                setHasStarted(true);
            } else {
                localStorage.removeItem('testStartTime');
                navigate('/done', { state: { status: 'time-finished' } });
                submitCode();
            }
        }
    }, []);

    // Timer starts only after test starts
    useEffect(() => {
    if (!hasStarted) return;
    const interval = setInterval(() => {
        setGlobalTimeElapsed((prev) => {
            return prev + 1;
        });
    }, 1000);
    return () => clearInterval(interval);
}, [hasStarted]);


    // Get question ids
    const startTest = async () => {
        setLoading(true)
        const storedStartTime = localStorage.getItem('testStartTime');
        if (!storedStartTime) {
            localStorage.setItem('testStartTime', Date.now().toString());
        }
        await getQuestion()
        setHasStarted(true);
        setLoading(false)
    }

    // Get specific question
    const getQuestion = async () => {

        const result = await testService.getQuestion();

        // Check for empty response
        if (result.message == 'There is no question to attempt') {
            navigate('/done', { state: { status: 'completed', globalTimeElapsed: globalTimeElapsed } });
            return;
        }

        if (result.error) {
            setQuestionData(null);
        } else {
            setQuestionData(result.question);
            let starterCode = "";
            if (result.question.language === "python") {
                starterCode = `# ${result.question.question}\ndef ${result.question.function_name}(...):\n    `;
            } else if (result.question.language === "javascript") {
                starterCode = `// ${result.question.question}\nfunction ${result.question.function_name}() {\n  \n}`;
            } else if (result.question.language === "react") {
                starterCode = `// ${result.question.question}\nimport React from 'react';\n\nfunction ${result.question.function_name}() {\n  return (\n    <div>\n      {/* Your JSX here */}\n    </div>\n  );\n}`;
            } else {
                starterCode = `// ${result.question.question}\n// Write your code here`;
            }
            setCode(starterCode);
        }

        setFeedback("");
        setRunResults([]);
        setSubmitted(false);
        setSubmittedMessage("");
        SetSubmitLoading(false)
        setQuestionIndex(result.question_number)
        SetTotalQuestions(result.total_questions)
        setQuestionTimeElapsed(0);
    }



    // Run the code
    // const runCode = async () => {
    //     if (questionData == null) {
    //         message.error('Question not found')
    //         return
    //     }
    //     const result = await testService.runCode(questionData, code)
    //     console.log("run result", result)
    //     if (result.error) {
    //         console.log("reosoifj")
    //         setFeedback("❌ Runtime Error: " + result.error);
    //     } else {
    //         setRunResults(result.results ?? result.error);
    //         setFeedback("✅ Code ran successfully. Review the output.");
    //     }
    // };

    // submit code
    const submitCode = async () => {

        if (submitted) return;

        if (questionData == null) {
            message.error('Question not found')
            return
        }

        SetSubmitLoading(true)
        setSubmitted(true);

        const result = await testService.submitCode({
            ...questionData,
            time_taken: questionTimeElapsed // Include this in your payload
        }, code);

        if (!questionData || !code || !result) return;


        setSubmittedMessage("✅ Code submitted successfully. Click 'Next' to continue.");
        SetSubmitLoading(false)
    };

    // move to next question

    if (loading || questionData == null) {
        return (
            <LoadingScreen />
        )
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Header */}
                        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Question {questionIndex}</h2>
                            <div className="flex items-center bg-blue-700 rounded-full px-4 py-1">
                                <Clock size={18} className="mr-2" />
                                <span className="font-mono">
                                    {Math.floor(questionTimeElapsed / 60)}:{String(questionTimeElapsed % 60).padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Warning banner (if needed) */}
                        {violationCount > 0 && violationCount < 4 && (
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                                <div className="flex items-center">
                                    <AlertTriangle size={20} className="text-orange-500 mr-2" />
                                    <span className="text-orange-800">
                                        Warning: You switched tabs or windows {violationCount} time{violationCount > 1 ? "s" : ""}. Test will end after 3 violations.
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            {/* Question description */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Problem Description</h3>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-gray-700">{questionData.question}</p>
                                </div>
                            </div>

                            {/* Code Editor */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Solution</h3>
                                <CodeEditor code={code} language={questionData.language} setCode={setCode} />
                            </div>

                            {/* Action buttons */}
                            <div className="flex space-x-4 mb-8">
                                {/* <button
                                onClick={runCode}
                                disabled={submitted}
                                className={`flex items-center px-4 py-2 rounded-md ${submitted ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                                <Play size={18} className="mr-2" />
                                Run Code
                            </button> */}
                                <button
                                    onClick={submitCode}
                                    disabled={submitted}
                                    className={`flex items-center px-4 py-2 rounded-md ${submitted
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                        }`}
                                >
                                    {submitLoading && <Loader size={18} className="mr-2 animate-spin" />}
                                    Submit Answer
                                </button>

                            </div>

                            {/* Test results */}
                            {runResults.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Test Results</h3>
                                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="grid grid-cols-4 bg-gray-100 text-gray-600 font-medium text-sm">
                                            <div className="p-3">Input</div>
                                            <div className="p-3">Expected</div>
                                            <div className="p-3">Output</div>
                                            <div className="p-3">Result</div>
                                        </div>
                                        {runResults.map((r: any, i) => (
                                            <div key={i} className={`grid grid-cols-4 text-sm border-t border-gray-200 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                <div className="p-3 font-mono">{r.input}</div>
                                                <div className="p-3 font-mono">{r.expected}</div>
                                                <div className="p-3 font-mono">{r.actual}</div>
                                                <div className="p-3">
                                                    {r.match ? (
                                                        <div className="flex items-center text-green-600">
                                                            <CheckCircle size={16} className="mr-1" />
                                                            Pass
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-red-600">
                                                            <XCircle size={16} className="mr-1" />
                                                            Fail
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Feedback */}
                            {feedback && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Feedback</h3>
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
                                        {feedback}
                                    </div>
                                </div>
                            )}

                            {/* Submission message */}
                            {submittedMessage && (
                                <div className="mb-8">
                                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                                        <div className="flex items-center text-green-700">
                                            <CheckCircle size={20} className="mr-2" />
                                            <strong>{submittedMessage}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Next question button */}
                            {submitted && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => totalQuestions == questionIndex ? navigate('/done', { state: { status: 'completed', globalTimeElapsed: globalTimeElapsed } }) : getQuestion()}
                                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
                                    >
                                        {totalQuestions == questionIndex ? 'Finish Test' : 'Next Question'}
                                        <ChevronRight size={18} className="ml-1" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}

export default Questionaries

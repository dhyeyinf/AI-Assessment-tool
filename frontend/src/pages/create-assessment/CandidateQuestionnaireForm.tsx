import { useState, useEffect } from 'react';
import { Input, Select, Button, Card, Checkbox, Typography, Row, Col, message, Divider } from 'antd';
import { Mail, Filter, Send, User, Copy } from 'lucide-react';
import { testService } from '../../services/test.service';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { authService } from '../../services/auth.service';

const { Title, Text } = Typography;
const { Option } = Select;

const CandidateQuestionnaireForm = () => {
    const [form, setForm] = useState({ email: '' });
    const [questions, setQuestions] = useState<Array<any>>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Array<any>>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        language: '',
        role: ''
    });
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
    const navigate = useNavigate();

    // Get unique languages and roles for filter options
    const languages = [...new Set(questions.map(q => q.language))];
    const roles = [...new Set(questions.map(q => q.role))];

    useEffect(() => {
        const rawData = localStorage.getItem('candidateDetail');
        if (!rawData || rawData == null) {
            navigate('/');
            return;
        }
        const user = JSON.parse(rawData);
        if (user.email !== 'cosgrid@gmail.com')
            navigate('/');
    }, [navigate]);

    // Fetch questions from backend
    useEffect(() => {
        const getQuestions = async () => {
            try {
                setLoading(true);
                const response = await testService.getAllQuestions();
                if (response?.success) {
                    setQuestions(response.data);
                    setFilteredQuestions(response.data);
                } else {
                    message.error('Failed to load questions');
                }
            } catch (error) {
                console.error('Error fetching questions:', error);
                message.error('Error loading questions');
            } finally {
                setLoading(false);
            }
        };

        getQuestions();
    }, []);

    // Filter questions based on selected filters
    useEffect(() => {
        let filtered = questions;

        if (filters.language) {
            filtered = filtered.filter(q => q.language === filters.language);
        }

        if (filters.role) {
            filtered = filtered.filter(q => q.role === filters.role);
        }

        setFilteredQuestions(filtered);

        // Clear selected questions if they're no longer in filtered results
        const filteredIds = filtered.map(q => q.id);
        setSelectedQuestions(prev => prev.filter(id => filteredIds.includes(id)));
    }, [filters, questions]);

    const handleFilterChange = (type: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const handleQuestionSelect = (questionId: number, checked: boolean) => {
        if (checked) {
            setSelectedQuestions(prev => [...prev, questionId]);
        } else {
            setSelectedQuestions(prev => prev.filter(id => id !== questionId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedQuestions(filteredQuestions.map(q => q.id));
        } else {
            setSelectedQuestions([]);
        }
    };

    const handleCopyCredentials = () => {
        if (generatedEmail && generatedPassword) {
            navigator.clipboard.writeText(
                `Email: ${generatedEmail}\nPassword: ${generatedPassword}`
            );
            message.success('Email and password copied!');
        }
    };
    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
            await authService.logout(refreshToken); // Calls your Django logout API
        }
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/get-started');
    };

    const handleSubmit = async () => {
        if (!form.email) {
            message.error('Please enter candidate email');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(form.email)) {
            message.error('Please enter a valid email address');
            return;
        }

        if (selectedQuestions.length === 0) {
            message.error('Please select at least one question');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                email: form.email,
                numberOfQuestions: selectedQuestions.length,
                questionnaires: selectedQuestions // Array of question IDs
            };

            // API call to send questionnaire
            const response = await testService.createAssessment(payload);

            if (response?.success) {
                setGeneratedPassword(response.password || null); // <-- Set generated password here
                setGeneratedEmail(form.email); // <-- Store email for display/copy
                message.success(`Questionnaire sent to ${form.email} with ${selectedQuestions.length} questions`);
            } else {
                setGeneratedPassword(null);
                setGeneratedEmail(null);
                message.error('Failed to send questionnaire');
            }

            // Reset form and filters if needed (do not reset password/email here)
            setForm({ email: '' });
            setSelectedQuestions([]);
            setFilters({ language: '', role: '' });

        } catch (error) {
            setGeneratedPassword(null);
            setGeneratedEmail(null);
            console.error('Error sending questionnaire:', error);
            message.error('Error sending questionnaire');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 relative">
        {/* Add the logout button here */}
        <button
            onClick={handleLogout}
            title="Logout"
            style={{
                position: 'absolute',
                top: 24, // adjust if needed
                right: 24, // adjust if needed
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                zIndex: 10,
            }}
        >
            <LogOut size={28} color="#333" />
        </button>
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <Card
                    className="mb-6"
                    title={
                        <div className="flex items-center gap-3">
                            <User className="w-6 h-6 text-blue-600" />
                            <Title level={2} className="!mb-0">Candidate Questionnaire</Title>
                        </div>
                    }
                    extra={
                        generatedPassword && generatedEmail ? (
                            <div
                                style={{
                                    background: '#fffbe6',
                                    border: '1px solid #ffe58f',
                                    borderRadius: 4,
                                    padding: '4px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    fontSize: 14,
                                    minWidth: 0,
                                    maxWidth: 400,
                                    wordBreak: 'break-all'
                                }}
                            >
                                <div>
                                    <strong>Email:</strong>
                                    <span style={{ fontFamily: 'monospace', marginLeft: 4 }}>{generatedEmail}</span>
                                    <br />
                                    <strong>Password:</strong>
                                    <span style={{ fontFamily: 'monospace', marginLeft: 4 }}>{generatedPassword}</span>
                                </div>
                                <Button
                                    icon={<Copy size={16} />}
                                    size="small"
                                    type="text"
                                    onClick={handleCopyCredentials}
                                />
                            </div>
                        ) : null
                    }
                >
                    <Text type="secondary">
                        Send customized technical questions to candidates based on role and programming language.
                    </Text>
                </Card>
                <Row gutter={24}>
                    {/* Left Column - Form and Filters */}
                    <Col xs={24} lg={8}>
                        <Card title="Candidate Information" className="mb-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Candidate Email
                                    </label>
                                    <Input
                                        prefix={<Mail className="w-4 h-4 text-gray-400" />}
                                        placeholder="candidate@example.com"
                                        size="large"
                                        value={form.email}
                                        onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>

                                <Divider />

                                <div className="flex items-center gap-2 mb-4">
                                    <Filter className="w-4 h-4 text-blue-600" />
                                    <Text strong>Filter Questions</Text>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Programming Language
                                    </label>
                                    <Select
                                        placeholder="Select language"
                                        value={filters.language}
                                        onChange={(value) => handleFilterChange('language', value)}
                                        allowClear
                                        size="large"
                                        className="w-full"
                                        loading={loading}
                                    >
                                        {languages.map(lang => (
                                            <Option key={lang} value={lang}>
                                                {lang?.charAt(0).toUpperCase() + lang?.slice(1)}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role
                                    </label>
                                    <Select
                                        placeholder="Select role"
                                        value={filters.role}
                                        onChange={(value) => handleFilterChange('role', value)}
                                        allowClear
                                        size="large"
                                        className="w-full"
                                        loading={loading}
                                    >
                                        {roles.map(role => (
                                            <Option key={role} value={role}>
                                                {role?.charAt(0).toUpperCase() + role?.slice(1)}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <Text strong className="text-blue-800">
                                        Selected Questions: {selectedQuestions.length}
                                    </Text>
                                    <br />
                                    <Text className="text-blue-600">
                                        Filtered Questions: {filteredQuestions.length}
                                    </Text>
                                </div>

                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<Send className="w-4 h-4" />}
                                    className="w-full"
                                    disabled={selectedQuestions.length === 0 || !form.email}
                                    onClick={handleSubmit}
                                    loading={loading}
                                >
                                    Send Questionnaire
                                </Button>
                            </div>
                        </Card>
                    </Col>
                    {/* Right Column - Questions List */}
                    <Col xs={24} lg={16}>
                        <Card
                            title={
                                <div className="flex justify-between items-center">
                                    <span>Available Questions ({filteredQuestions.length})</span>
                                    <Checkbox
                                        checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                                        indeterminate={selectedQuestions.length > 0 && selectedQuestions.length < filteredQuestions.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        disabled={filteredQuestions.length === 0}
                                    >
                                        Select All
                                    </Checkbox>
                                </div>
                            }
                            loading={loading}
                        >
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {filteredQuestions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Text type="secondary">
                                            {loading ? 'Loading questions...' : 'No questions match the selected filters'}
                                        </Text>
                                    </div>
                                ) : (
                                    filteredQuestions.map((question) => (
                                        <Card
                                            key={question.id}
                                            size="small"
                                            className={`border transition-all duration-200 ${selectedQuestions.includes(question.id)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    checked={selectedQuestions.includes(question.id)}
                                                    onChange={(e) => handleQuestionSelect(question.id, e.target.checked)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {question.language}
                                                        </span>
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                            {question.role}
                                                        </span>
                                                        {question.answeredcheck && (
                                                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                                                Previously Answered
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Text strong className="block mb-1">
                                                        {question.function_name}
                                                    </Text>
                                                    <Text className="text-gray-600 text-sm">
                                                        {question.question}
                                                    </Text>
                                                    {question.test_cases && question.test_cases.length > 0 && (
                                                        <div className="mt-2">
                                                            <Text className="text-xs text-gray-500">
                                                                {question.test_cases.length} test case{question.test_cases.length !== 1 ? 's' : ''}
                                                            </Text>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
        </div>
    );
};

export default CandidateQuestionnaireForm;


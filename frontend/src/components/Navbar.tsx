import { Layout, Typography } from 'antd';
import { Shield, Code, Lock } from 'lucide-react';

const { Header } = Layout;
const { Text } = Typography;

interface Props {
    logoSrc?: string | null;
    companyName?: string
    assessmentTitle?: string;
    isProtected?: boolean
}

const Navbar: React.FC<Props> = ({
    logoSrc = 'https://vcdn.cosgrid.com/COSGridNet/common/cosgrid-logo.png',
    companyName = "TechAssess",
    assessmentTitle = "Technical Assessment",
    isProtected = false
}) => {
    return (
        <Header className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between shadow-sm sticky top-0 z-50">
            {/* Left - Logo */}
            <div className="flex items-center gap-3">
                {logoSrc ? (
                    <img
                        src={logoSrc}
                        alt="Company Logo"
                        className="h-8 w-auto object-contain"
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Code className="w-5 h-5 text-white" />
                        </div>
                        <Text strong className="text-lg text-gray-800 hidden sm:block">
                            {companyName}
                        </Text>
                    </div>
                )}
            </div>

            {/* Center - Assessment Info */}
            <div className="flex items-center gap-3  px-4 py-2 rounded-lg">
                <Shield className="w-8 h-8 text-blue-600" />
                <div className="text-center">
                    <Text strong className="!text-white block !text-xl">
                        {assessmentTitle}
                    </Text>
                    {isProtected && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                            <Lock className="w-3 h-3 text-orange-500" />
                            <Text className="text-xs text-orange-600 font-medium">
                                Protected Environment
                            </Text>
                        </div>
                    )}
                </div>
            </div>

            {/* Right - Status Indicator */}
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Text className="text-xs !text-white hidden sm:block">
                    Session Active
                </Text>
            </div>
        </Header>
    );
};

export default Navbar
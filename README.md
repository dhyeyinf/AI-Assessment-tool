# AI Assessment Tool

A comprehensive full-stack web application designed for conducting secure, AI-powered technical assessments with real-time monitoring and automated evaluation.

## Features

### Security & Monitoring
- **Anti-Cheating Measures**: Disabled copy-paste functionality and tab switching detection
- **Session Management**: Unique assessment sessions per email ID with secure authentication
- **Multiple Login Detection**: Prevents simultaneous logins from different devices
- **Real-time Warnings**: Progressive warning system (3 strikes policy for tab switching)
- **Timer Integration**: Countdown timer with automatic submission

### 🤖 AI-Powered Evaluation
- **OpenAI Integration**: Automated answer evaluation using GPT models
- **Intelligent Scoring**: AI-based scoring out of 10 for each response
- **Detailed Feedback**: Comprehensive analysis highlighting errors and shortcomings
- **Performance Insights**: Identifies specific areas for improvement

### Advanced Reporting
- **PDF Generation**: Automated PDF report creation with complete assessment results
- **Email Integration**: Automatic report delivery to HR/CEO email addresses
- **Comprehensive Analytics**: Detailed breakdown of candidate performance
- **Professional Format**: Clean, organized PDF layout for easy review

### HR Dashboard
- **Question Management**: HR can select and customize assessment questions
- **Candidate Monitoring**: Real-time tracking of assessment progress
- **Result Analysis**: Comprehensive overview of all candidate performances
- **Email Notifications**: Instant alerts for completed assessments

## Tech Stack

### Backend
- **Django**: Python web framework for robust backend development
- **Redis**: In-memory data store for session management and question caching
- **OpenAI API**: AI-powered answer evaluation and scoring
- **SQLite/PostgreSQL**: Database for storing user data and assessment results

### Frontend
- **HTML5/CSS3**: Modern, responsive user interface
- **JavaScript**: Interactive features and real-time functionality
- **Bootstrap**: Responsive design framework

### Additional Technologies
- **PDF Generation**: ReportLab/WeasyPrint for professional PDF creation
- **Email Service**: SMTP integration for automated email delivery
- **Session Management**: Django sessions with Redis backend
- **Real-time Monitoring**: WebSocket/AJAX for live updates

## Prerequisites

- Python 3.8+
- Redis Server
- OpenAI API Key
- SMTP Email Configuration

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhyeyinf/AI-Assessment-tool.git
   cd AI-Assessment-tool
   ```

2. **Create virtual environment**
   ```bash
   python -m venv assessment_env
   source assessment_env/bin/activate  # On Windows: assessment_env\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Create .env file
   OPENAI_API_KEY=your_openai_api_key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_app_password
   REDIS_URL=redis://localhost:6379/0
   ```

5. **Start Redis server**
   ```bash
   redis-server
   ```

6. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

8. **Start the development server**
   ```bash
   python manage.py runserver
   ```

## Usage

### For HR/Admin:
1. Login to admin dashboard
2. Create assessment questions
3. Generate unique assessment links for candidates
4. Monitor real-time assessment progress
5. Receive automated PDF reports via email

### For Candidates:
1. Access assessment via unique link
2. Complete identity verification
3. Take timed assessment with security monitoring
4. Submit answers for AI evaluation
5. Receive immediate feedback (if configured)

## Project Structure

```
AI-Assessment-tool/
├── assessment/
│   ├── models.py          # Database models
│   ├── views.py           # View controllers
│   ├── urls.py            # URL routing
│   └── utils.py           # Utility functions
├── templates/
│   ├── assessment/        # Assessment templates
│   └── admin/             # Admin interface templates
├── static/
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   └── images/            # Static images
├── reports/               # Generated PDF reports
├── requirements.txt       # Python dependencies
└── manage.py              # Django management script
```

## Key Features Implementation

### Anti-Cheating System
```javascript
// Tab switching detection
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        warningCount++;
        showWarning();
        if (warningCount >= 3) {
            submitAssessment();
        }
    }
});
```

### AI Evaluation Integration
```python
# OpenAI API integration for answer evaluation
def evaluate_answer(question, answer):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{
            "role": "system",
            "content": "Evaluate this answer and provide score out of 10..."
        }]
    )
    return parse_ai_response(response)
```

## Performance Metrics

- **Response Time**: < 2 seconds for assessment loading
- **Concurrent Users**: Supports 100+ simultaneous assessments
- **AI Evaluation**: Average processing time of 3-5 seconds per answer
- **PDF Generation**: < 10 seconds for comprehensive reports

## Security Features

- Session-based authentication
- CSRF protection
- Input validation and sanitization
- Secure PDF generation
- Encrypted data transmission
- Rate limiting for API calls

## Future Enhancements

- [ ] Video proctoring integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Integration with popular ATS systems
- [ ] Blockchain-based certificate generation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Developer

**Dhyey** - Full Stack Developer
- GitHub: [@dhyeyinf](https://github.com/dhyeyinf)
- LinkedIn: [LinkedIN](https://www.linkedin.com/in/dhyeyfindoriya/)
- Email: dhyey.inf323@gmail.com

## Acknowledgments

- OpenAI for powerful AI evaluation capabilities
- Django community for excellent documentation
- Redis team for efficient caching solutions
- Contributors and testers who helped improve the platform

---

⭐ **Star this repository if you found it helpful!** ⭐

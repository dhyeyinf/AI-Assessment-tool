#assessment/backend/assessment/reports/utils.py

from django.core.mail import EmailMessage

def send_report_email_django(filepath, candidate_name, recipients):
    subject = f"Assessment Report for {candidate_name}"
    body = f"Dear Team,\n\nPlease find attached the assessment report for {candidate_name}."
    email = EmailMessage(
        subject,
        body,
        'findoriyadhyey@gmail.com',  # Replace with your sender email or use settings.DEFAULT_FROM_EMAIL
        recipients,
    )
    email.attach_file(filepath)
    email.send(fail_silently=False)

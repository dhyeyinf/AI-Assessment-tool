import random
from openai import OpenAI
import os
from datetime import datetime
from fpdf import FPDF
import secrets
from datetime import datetime
from rest_framework.views import APIView
from django.http import JsonResponse
import sys
import io
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
import sys
import io
import traceback
import traceback
import string
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
import os
import json
from .utils import send_report_email_django
import redis
from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes
from .models import Question, TestAuthorization
from .serializers import TestAuthorizationSerializer
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from django.contrib.auth import get_user_model


User = get_user_model()
openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key) if openai_api_key else None

redis_client = redis.Redis(host='192.168.9.174', port=6379, db=0)

# Set the directory to save reports
REPORTS_DIR = os.path.join(os.path.dirname(__file__), 'reports')
os.makedirs(REPORTS_DIR, exist_ok=True)

# class DeleteUserView(APIView):
#     permission_classes = [IsAuthenticated]
#     def delete(self, request):
#         user = request.user
#         user.delete()
#         return Response({"detail": "User deleted"}, status=status.HTTP_204_NO_CONTENT)

class LogoutView(APIView):
    def post(self, request):
        user = request.user
        user.active_jti = None
        user.save(update_fields=['active_jti'])
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response(status=status.HTTP_205_RESET_CONTENT)

class SingleSessionTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # Step 1: Get user from request data (before authentication)
        try:
            user = User.objects.get(username=request.data.get('username'))
        except User.DoesNotExist:
            # Let parent class handle invalid credentials
            return super().post(request, *args, **kwargs)

        # Step 2: Check for existing active session
        if user.active_jti:
            return Response(
                {"detail": "User already has an active session. Log out first."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Step 3: Proceed with authentication
        response = super().post(request, *args, **kwargs)
        
        # Step 4: Update active_jti on successful login
        if response.status_code == status.HTTP_200_OK:
            access_token = AccessToken(response.data['access'])
            user.active_jti = access_token['jti']
            user.save()

        return response

class SingleSessionTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # You may need to decode the refresh token to get the user
            # If request.user is not set, you can extract the user from the refresh token payload
            refresh_token = request.data.get('refresh')
            if refresh_token:
                try:
                    refresh = RefreshToken(refresh_token)
                    user_id = refresh['user_id']
                    user = User.objects.get(id=user_id)
                    access_token = AccessToken(response.data['access'])
                    user.active_jti = access_token['jti']
                    user.save()
                except Exception as e:
                    pass  # handle error as needed
        return response

class AssessmentViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['post'], url_path='create', permission_classes=[])
    def create_assessment(self, request):
        data = request.data
        email = data.get('email')
        question_ids = data.get('questionnaires', [])
        number_of_questions = data.get('numberOfQuestions', len(question_ids))

        if not email or not question_ids:
            return Response({"error": "Email and questionnaires are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Load all available questions from Redis
        question_data_raw = redis_client.get("session:questions")
        if not question_data_raw:
            return Response({"error": "No questions found in session."}, status=status.HTTP_404_NOT_FOUND)

        all_questions = json.loads(question_data_raw)

        # Filter and include only the questions that match the given IDs
        selected_questions = [q for q in all_questions if q["id"] in question_ids]

        if len(selected_questions) != len(question_ids):
            return Response({"error": "Some question IDs were not found."}, status=status.HTTP_400_BAD_REQUEST)
        alphabet = string.ascii_letters + string.digits + string.punctuation
        password = ''.join(secrets.choice(alphabet) for i in range(12))  # 12-char random password
        user = User.objects.create_user(username=email, email=email, password=password)
        user.save()
        # Construct session data
        session_data = {
            "email": email,
            "number_of_questions": number_of_questions,
            "test_date": datetime.now().strftime("%d/%m/%Y"),
            "questionaries": selected_questions
        }

        # Save session to Redis
        redis_client.set(f"session:{email}", json.dumps(session_data))

        return Response({
        "success": True,
        "message": "Successfully uploaded",
        "password": password
    }, status=status.HTTP_201_CREATED)
    
  
    @action(detail=False, methods=['get'], url_path='get-redis-data')
    # @permission_classes([AllowAny])
    def get_redis_data(self, request):
        key = request.GET.get('key')
        value = redis_client.get(f"session:{key}")
        if value:
            session = json.loads(value)
            return Response({"success": True, "data": session}, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'], url_path="post-questions")
    def upload_questions(self, request):
        data = request.data

        redis_client.set('session:questions', json.dumps(data))
        return Response({"message": "Uploaded successfully"}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path="start")
    def start(self, request):
        role = request.GET.get("role", "").strip().lower()

        if not role:
            return Response({"error": "Role is required to start the assessment."}, status=400)

        matching_questions = Question.objects.filter(role=role).values_list('id', flat=True)

        if not matching_questions:
            return Response({"error": f"No questions found for role: {role}"}, status=404)

        if len(matching_questions) < 4:
            return Response({"error": f"Not enough questions available for role '{role}'. Need at least 4."}, status=400)

        selected = random.sample(list(matching_questions), 4)
        request.session['question_ids'] = selected
        request.session['candidate_role'] = role  # Optional: store role in session

        return Response({"message": f"Assessment started for role '{role}'", "total": 4})

    @action(detail=False, methods=['get'], url_path="get-question")
    def get_question(self, request):
        user = request.user

        redis_key = f"session:{user}"
        session_data = redis_client.get(redis_key)

        if not session_data:
            return Response({"error": "No active session found."}, status=404)

        question_list = json.loads(session_data)
        print(question_list)
        for index, data in enumerate(question_list['questionaries']):
            if not data['answeredcheck']:
                return Response({ "success": True,
                    "message": "Question there",
                    "question_number": index + 1,
                    "total_questions": len(question_list['questionaries']),
                    "question": data,
                }, status=status.HTTP_200_OK)

        return Response({"success": True, "message": "There is no question to attempt"}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='run-code')
    def run(self, request):
        data = request.data
        code = data.get("code", "")
        function_name = data.get("function_name", "")
        test_cases = data.get("test_cases", [])

        try:
            exec_globals = {}
            exec(code, exec_globals)

            results = []
            for case in test_cases:
                raw_input = case["input"]
                expected_output = case["output"]
                args = eval(f"[{raw_input}]")
                result = exec_globals[function_name](*args)
                try:
                    expected = eval(expected_output)
                except:
                    expected = expected_output
                match = result == expected

                results.append({
                    "input": raw_input,
                    "expected": expected_output,
                    "actual": str(result),
                    "match": match
                })

            return Response({ "results": results })
        except Exception as e:
            return Response({ "error": str(e) }, status=status.HTTP_200_OK)
    
    
    @action(detail=False, methods=["post"], url_path="generate-pdf")
    def generate_pdf(self, request):
        user = request.user
        data = request.data
        candidate_name = data.get("candidate_name", "")
        redis_key = f"session:{user}"

        session_data_raw = redis_client.get(redis_key)
        if not session_data_raw:
            return Response({"error": "No active session found."}, status=404)
        session_data = json.loads(session_data_raw)
        question_list = session_data.get("questionaries", [])

        # Calculate total time as sum of all per-question times
        total_time_seconds = sum(item.get("time_taken", 0) for item in question_list)
        total_minutes = total_time_seconds // 60
        total_seconds = total_time_seconds % 60

        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()

        # Header
        pdf.set_font('Arial', 'B', 18)
        pdf.set_text_color(30, 30, 120)
        pdf.cell(0, 12, 'Assessment Report', ln=True, align='C')
        pdf.ln(5)

        pdf.set_font('Arial', 'B', 13)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 10, f"Candidate: {candidate_name}", ln=True)
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 9, f"Questions Attempted: {len(question_list)}", ln=True)
        pdf.set_font('Arial', 'B', 12)
        pdf.set_text_color(0, 100, 0)
        pdf.cell(0, 10, f"Total Time Taken: {total_minutes} minutes {total_seconds} seconds", ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(5)

        # Instructions for HR/CEO
        pdf.set_font('Arial', 'I', 11)
        pdf.set_text_color(100, 100, 100)
        pdf.multi_cell(0, 8, "Each question starts on a new page. Time spent per question is shown in bold green.")
        pdf.set_text_color(0, 0, 0)
        pdf.ln(2)

        for idx, item in enumerate(question_list, 1):
            pdf.add_page()  # New page for each question

            # Question header with time
            q_time = item.get("time_taken", 0)
            q_minutes = q_time // 60
            q_seconds = q_time % 60

            # Question number and time
            pdf.set_font('Arial', 'B', 14)
            pdf.set_text_color(0, 0, 120)
            pdf.cell(0, 10, f"Question {idx}", ln=True)
            pdf.set_font('Arial', 'B', 12)
            pdf.set_text_color(0, 140, 40)
            pdf.cell(0, 9, f"Time Spent: {q_minutes}m {q_seconds}s", ln=True)
            pdf.ln(2)

            # Question text
            pdf.set_font('Arial', '', 12)
            pdf.set_text_color(0, 0, 0)
            pdf.multi_cell(0, 9, f"{item['question']}")
            pdf.ln(2)

            # Code answer block
            pdf.set_font('Arial', 'B', 12)
            pdf.set_text_color(0, 80, 0)
            pdf.cell(0, 8, "Answer:", ln=True)
            pdf.ln(1)
            pdf.set_fill_color(235, 235, 235)
            pdf.set_font('Courier', '', 10)
            pdf.set_text_color(40, 40, 40)
            code = item['answered']['code'] or "No answer provided."
            for line in code.split('\n'):
                pdf.multi_cell(0, 6, line, 0, 'L', True)
            pdf.ln(2)

            # Evaluation block
            pdf.set_font('Arial', 'B', 12)
            pdf.set_text_color(120, 0, 0)
            pdf.cell(0, 8, "Evaluation:", ln=True)
            pdf.ln(1)
            pdf.set_font('Arial', '', 11)
            pdf.set_text_color(40, 40, 40)
            eval_text = item['answered']['evaluation'] or "No evaluation available."

            for line in eval_text.split('\n'):
                lower_line = line.strip().lower()
                if lower_line.startswith("code quality:") or lower_line.startswith("issues:"):
                    pdf.set_font('Arial', 'B', 11)
                    pdf.set_text_color(0, 0, 0)
                    pdf.multi_cell(0, 7, line)
                    pdf.set_font('Arial', '', 11)
                    pdf.set_text_color(40, 40, 40)
                else:
                    pdf.multi_cell(0, 7, line)
            pdf.ln(2)



        # Save to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_name = candidate_name.replace(" ", "_")
        filename = f"{safe_name}_{timestamp}.pdf"
        filepath = os.path.join(REPORTS_DIR, filename)

        pdf.output(filepath)


        # recipients = ['careers@cosgrid.com','murugavel@cosgrid.com']
        recipients = ['findoriyadhyey@gmail.com']
        #send_report_email_django(filepath, candidate_name, recipients)

        try:
            User.objects.filter(username=user).delete()
        except Exception as e:
            print(f"Error deleting TestAuthorization for {user}: {e}")

        return Response('Uploaded Successfully', status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='submit-code')
    def evaluate(self, request):
        user = request.user
        redis_key = f"session:{user}"
        data = request.data
        code = data.get("code", "")
        question_data = data.get('questionData', None)

        prompt = f"""
    You are a strict but fair code evaluator for programming assessments.

    Candidate's Code:
    {code}

    Problem Description:
    {question_data['question']}

    Test Cases:
    {question_data['test_cases']}

    Your Job:
    1. Execute the candidate’s code with all test cases and determine how many pass and how many fail.
    2. Evaluate the **code quality on a scale from 0 to 10**, considering:
    - Readability and formatting
    - Algorithm efficiency (avoidance of brute force)
    - Use of best practices, structure, and logic flow
    - Naming conventions and comments (if any)
    3. **Pinpoint specific lines** in the candidate’s code that are:
    - Incorrect
    - Inefficient
    - Redundant
    - Suspect (e.g., hardcoded values, poor practices)

    Respond only in **valid JSON** with the following structure:

    {{
    "passed": <number>,
    "total": <number>,
    "feedback": "Brief summary of logic and test case results.",
    "quality_score": <0-10>,
    "quality_feedback": "Why that score was given.",
    "code_issues": [
        {{
        "line": <line number or snippet>,
        "issue": "Description of the problem or inefficiency on that line"
        }}
    ]
    }}
    """

        try:
            if client is None:
                return Response({"error": "OpenAI API key not set."}, status=500)

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            output = response.choices[0].message.content
            json_data = json.loads(output.strip())

            # Prepare answer data
            question_data['answered'] = {
                "code": code,
                "evaluation": (
                    f"Passed {json_data.get('passed', 0)}/{json_data.get('total', 0)}. {json_data.get('feedback', '')}\n\n"
                    f"Code Quality: {json_data.get('quality_score', 0)}/10\n"
                    f"Reason: {json_data.get('quality_feedback', '')}\n\n"
                    f"Issues:\n" +
                    "\n".join([
                        f"  {i + 1}. Line {issue.get('line')}: {issue.get('issue')}"
                        for i, issue in enumerate(json_data.get('code_issues', []))
                    ])
                )
            }
            question_data['answeredcheck'] = True

            # Retrieve and update session data from Redis
            session_data_raw = redis_client.get(redis_key)

            if not session_data_raw:
                return Response({"error": "No active session found."}, status=404)

            session_data = json.loads(session_data_raw)

            # Find and update question by ID
            question_id = question_data.get("id")
            for i, q in enumerate(session_data.get("questionaries", [])):
                if q.get("id") == question_id:
                    session_data["questionaries"][i] = question_data
                    break
            else:
                return Response({"error": "Question not found in session."}, status=404)

            # Save updated session back to Redis
            redis_client.set(redis_key, json.dumps(session_data))

            return Response({"success": True, "message": "Submitted Successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    
class TestAuthorizationViewset(viewsets.ModelViewSet):
    queryset = TestAuthorization.objects.all()
    serializer_class = TestAuthorizationSerializer  

    @action(detail=False, methods=['post'], url_path='validate-candidate')
    def validate_candidate(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        if not email or not code:
            return Response({"error": "Email and Code are mandatory fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            details = TestAuthorization.objects.get(email=email)
        except TestAuthorization.DoesNotExist:
            return Response({"error": "Enter a valid Email"}, status=status.HTTP_400_BAD_REQUEST)

        if details.access_code != code:
            return Response({"error": "Invalid Code"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TestAuthorizationSerializer(details)
        return Response({
            "success": True,
            "message": "Verified successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
  # @action(detail=False, methods=['post'], url_path='run-code', permission_classes=[])
    # def run_code(self, request):
    #     data = request.data
    #     code = data.get('code', '')
    #     test_cases = data.get('test_cases', [])
    #     function_name = data.get('function_name', '')  # 👈 Needed to call candidate's function

    #     if not code:
    #         return Response({"error": "Code is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    #     if not function_name:
    #         return Response({"error": "Function name is required."}, status=status.HTTP_400_BAD_REQUEST)

    #     results = []

    #     for test_case in test_cases:
    #         input_data = test_case.get('input', '')
    #         expected_output = test_case.get('output', '')

    #         # Combine candidate code, test case input, and a call to the function
    #         try:
    #             var_name, var_value = input_data.split("=", 1)
    #             var_name = var_name.strip()
    #             var_value = var_value.strip()
    #             call_line = f"print({function_name}({var_name}))"
    #             full_code = f"{code}\n{var_name} = {var_value}\n{call_line}"
    #         except Exception as e:
    #             results.append({
    #                 'input': input_data,
    #                 'expected': expected_output,
    #                 'actual': f"Error preparing test case: {str(e)}",
    #                 'match': False
    #             })
    #             continue

    #         # Log the full code for debugging
    #         logger.debug("=== FULL CODE TO EXECUTE ===")
    #         logger.debug(full_code)
    #         logger.debug("============================")

    #         # Redirect stdout to capture printed output
    #         old_stdout = sys.stdout
    #         redirected_output = sys.stdout = io.StringIO()

    #         try:
    #             exec_globals = {"__builtins__": __builtins__}
    #             exec_locals = {}

    #             exec(full_code, exec_globals, exec_locals)
    #             actual_output = redirected_output.getvalue().strip()

    #             # Attempt JSON comparison
    #             try:
    #                 expected_clean = str(expected_output).strip().replace("'", "\"")
    #                 actual_clean = str(actual_output).strip().replace("'", "\"")
    #                 match = json.loads(actual_clean) == json.loads(expected_clean)
    #             except Exception:
    #                 # Fallback to raw string comparison
    #                 match = actual_output == expected_output

    #             results.append({
    #                 'input': input_data,
    #                 'expected': expected_output,
    #                 'actual': actual_output,
    #                 'match': match
    #             })

    #         except Exception as e:
    #             results.append({
    #                 'input': input_data,
    #                 'expected': expected_output,
    #                 'actual': f"Error: {str(e)}",
    #                 'match': False
    #             })
    #         finally:
    #             sys.stdout = old_stdout  # Restore stdout

    #     return Response({
    #         'success': True,
    #         'results': results
    #     })

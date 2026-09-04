import os
import smtplib
import sqlite3
from email.message import EmailMessage
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = os.getenv('SECRET_KEY', 'ashs-gym-secret-key')

# Store submitted join applications in a database beside this Python file.
DATABASE_PATH = Path(__file__).with_name('submissions.db')


def get_db_connection():
    database_connection = sqlite3.connect(DATABASE_PATH)
    database_connection.row_factory = sqlite3.Row
    return database_connection


def init_db():
    # Create the applications table when the server starts for the first time.
    database_connection = get_db_connection()
    database_connection.execute(
        '''
        CREATE TABLE IF NOT EXISTS gym_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            grade TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            preferred_program TEXT NOT NULL,
            fitness_goals TEXT NOT NULL,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        '''
    )
    database_connection.commit()
    database_connection.close()


init_db()


def send_email(subject, body, recipient):
    # Email is optional, so return False when SMTP settings are not configured.
    smtp_host = os.getenv('SMTP_HOST', '').strip()
    if not smtp_host:
        return False

    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_username = os.getenv('SMTP_USERNAME', '').strip()
    smtp_password = os.getenv('SMTP_PASSWORD', '').strip()
    sender_email = os.getenv('SMTP_FROM', smtp_username).strip()

    if not smtp_username or not smtp_password:
        return False

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = recipient
    msg.set_content(body)

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        return True
    except Exception:
        return False


def send_join_notification(data):
    # Send a confirmation to the applicant and a notification to the gym admin.
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip()
    admin_email = os.getenv('ADMIN_EMAIL', 'info@ashs.school.nz').strip()

    subject = 'New ASHS Gym Join Request'
    body = (
        f'New gym join request received.\n\n'
        f'Full name: {full_name}\n'
        f'Age: {data.get("age", "")}\n'
        f'Grade: {data.get("grade", "")}\n'
        f'Email: {email}\n'
        f'Phone: {data.get("phone", "")}\n'
        f'Reason: {data.get("fitness_goals", "")}\n'
    )

    if email:
        send_email('ASHS Gym Join Request Received', 'Thanks for requesting to join ASHS Gym. We have received your details and will contact you soon.', email)
    if admin_email:
        send_email(subject, body, admin_email)


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/join')
@app.route('/join.html')
def join_page():
    return send_from_directory(app.static_folder, 'join.html')


@app.route('/submit-application', methods=['POST'])
def submit_application():
    # Read and clean the form values sent by the browser.
    application_data = request.get_json(silent=True) or {}
    full_name = (application_data.get('full_name') or '').strip()
    age_raw = application_data.get('age')
    grade = (application_data.get('grade') or '').strip()
    email = (application_data.get('email') or '').strip()
    phone = (application_data.get('phone') or '').strip()
    fitness_goals = (application_data.get('fitness_goals') or '').strip()
    preferred_program = (application_data.get('preferred_program') or 'No preference').strip()

    if not full_name or not grade or not fitness_goals:
        return jsonify({'success': False, 'message': 'Please complete all required fields.'}), 400

    try:
        age = int(age_raw)
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Please enter a valid age.'}), 400

    try:
        database_connection = get_db_connection()
        database_connection.execute(
            '''
            INSERT INTO gym_applications (full_name, age, grade, email, phone, fitness_goals, preferred_program)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''',
            (full_name, age, grade, email, phone, fitness_goals, preferred_program),
        )
        database_connection.commit()
        database_connection.close()

        # send notification (optional)
        try:
            send_join_notification(application_data)
        except Exception:
            # don't fail the request if email sending fails
            pass

        return jsonify({
            'success': True,
            'message': 'Your join request has been saved successfully. We will contact you soon.'
        })
    except Exception as error:
        # Return JSON error so the client can show it
        return jsonify({'success': False, 'message': f'Server error: {error}'}), 500


@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory(app.static_folder, filename)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

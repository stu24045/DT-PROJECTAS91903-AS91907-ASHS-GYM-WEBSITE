import json
import urllib.request
import sqlite3
import sys
import os

print('Starting test submit...')

payload = {
    'full_name': 'HP Test',
    'age': 18,
    'grade': '13',
    'email': 'harsh.test@example.com',
    'phone': '0210775768',
    'fitness_goals': 'Want to get big'
}

url = 'http://127.0.0.1:5000/submit-application'
req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print('HTTP STATUS:', resp.status)
        body = resp.read().decode('utf-8', 'ignore')
        print('RESPONSE BODY:', body)
except Exception as e:
    print('POST ERROR:', repr(e))

# Check DB
db_path = os.path.join(os.path.dirname(__file__), '..', 'submissions.db')
db_path = os.path.abspath(db_path)
print('Checking DB at', db_path)
try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT id, full_name, email, submitted_at FROM gym_applications ORDER BY id DESC LIMIT 5")
    rows = cur.fetchall()
    print('DB ROWS:', rows)
    conn.close()
except Exception as e:
    print('DB ERROR:', repr(e))

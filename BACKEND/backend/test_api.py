import requests
import json

url = 'http://localhost:8000/api/register/'
data = {
    'username': 'testuser789',
    'email': 'test789@example.com',
    'password': 'TestPass123',
    'password2': 'TestPass123',
    'role': 'admin'
}

print('Testing registration API...')
print(f'URL: {url}')
print(f'Data: {json.dumps(data, indent=2)}')

try:
    response = requests.post(url, json=data)
    print(f'\nStatus: {response.status_code}')
    print(f'Response: {json.dumps(response.json(), indent=2)}')
except Exception as e:
    print(f'Error: {e}')

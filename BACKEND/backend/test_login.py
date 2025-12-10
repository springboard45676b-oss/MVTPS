import requests
import json

# First, let's test with a user we know exists (we created testuser789 earlier)
url = 'http://localhost:8000/api/login/'
data = {
    'email': 'test789@example.com',
    'password': 'TestPass123'
}

print('Testing login API...')
print(f'URL: {url}')
print(f'Data: {json.dumps(data, indent=2)}')

try:
    response = requests.post(url, json=data)
    print(f'\nStatus: {response.status_code}')
    print(f'Response: {json.dumps(response.json(), indent=2)}')
except Exception as e:
    print(f'Error: {e}')

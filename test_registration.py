#!/usr/bin/env python
"""
Test script for registration API
Run this to test the backend API independently
"""

import requests
import json

BASE_URL = 'http://localhost:8000/api'

def test_register():
    """Test user registration"""
    url = f'{BASE_URL}/register/'
    
    # Test data
    user_data = {
        'username': 'testoperator',
        'email': 'operator@test.com',
        'password': 'TestPass123',
        'password2': 'TestPass123',
        'first_name': 'Test',
        'last_name': 'Operator',
        'role': 'operator'
    }
    
    print(f'Testing POST to {url}')
    print(f'Data: {json.dumps(user_data, indent=2)}')
    
    try:
        response = requests.post(url, json=user_data, headers={'Content-Type': 'application/json'})
        print(f'\nStatus Code: {response.status_code}')
        print(f'Response: {json.dumps(response.json(), indent=2)}')
        
        if response.status_code == 201:
            print('\n✅ Registration successful!')
        else:
            print('\n❌ Registration failed!')
            
    except Exception as e:
        print(f'❌ Error: {str(e)}')

def test_roles():
    """Test getting available roles"""
    url = f'{BASE_URL}/roles/'
    
    print(f'\nTesting GET to {url}')
    
    try:
        response = requests.get(url)
        print(f'Status Code: {response.status_code}')
        print(f'Response: {json.dumps(response.json(), indent=2)}')
    except Exception as e:
        print(f'❌ Error: {str(e)}')

if __name__ == '__main__':
    print('=' * 60)
    print('Registration API Test')
    print('=' * 60)
    
    test_roles()
    print('\n' + '=' * 60)
    test_register()

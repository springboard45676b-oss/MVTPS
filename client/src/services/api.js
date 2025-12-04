// Mock API service for development
const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@vesselapp.com',
    role: 'admin',
    password: 'admin123'
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authAPI = {
  register: async (userData) => {
    await delay(500); // Simulate network delay
    
    // Check if user already exists
    const userExists = mockUsers.some(user => user.email === userData.email);
    if (userExists) {
      throw { 
        response: { 
          data: { 
            message: 'User with this email already exists' 
          } 
        } 
      };
    }

    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      token: `mock-token-${Date.now()}`
    };
    
    mockUsers.push(newUser);
    
    // Save token to localStorage
    localStorage.setItem('token', newUser.token);
    
    return { 
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: userData.role || 'user'
      },
      token: newUser.token
    };
  },
  
  login: async (credentials) => {
    await delay(500); // Simulate network delay
    
    const user = mockUsers.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    
    if (!user) {
      throw { 
        response: { 
          data: { 
            message: 'Invalid email or password' 
          } 
        } 
      };
    }
    
    // Generate a mock token
    const token = `mock-token-${Date.now()}`;
    
    // Save token to localStorage
    localStorage.setItem('token', token);
    
    return { 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  },
  
  getCurrentUser: async () => {
    await delay(300); // Simulate network delay
    
    // In a real app, this would validate the token with the backend
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    
    // For demo purposes, return the first user
    const user = mockUsers[0];
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }
};

// For components that might be using the default export
export default {
  ...authAPI
};

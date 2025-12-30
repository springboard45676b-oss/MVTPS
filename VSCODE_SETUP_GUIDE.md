# 🚢 Maritime Platform - VS Code Setup Guide

## 📋 Complete Guide to Run Maritime Platform in VS Code

This guide will walk you through setting up and running the Maritime Platform project in Visual Studio Code from scratch.

---

## 🛠️ Prerequisites

### **1. Required Software**
- **VS Code**: Download from [https://code.visualstudio.com/](https://code.visualstudio.com/)
- **Python 3.8+**: Download from [https://python.org](https://python.org)
- **Node.js 16+**: Download from [https://nodejs.org](https://nodejs.org)
- **Git**: Download from [https://git-scm.com](https://git-scm.com)

### **2. Verify Installations**
Open terminal and check versions:
```bash
python --version    # Should show Python 3.8+
node --version      # Should show Node 16+
npm --version       # Should show npm 8+
git --version       # Should show Git 2.x+
```

---

## 🔧 VS Code Extensions Setup

### **Essential Extensions**
Install these extensions in VS Code:

1. **Python** (Microsoft) - Python language support
2. **Pylance** (Microsoft) - Python IntelliSense
3. **Django** (Baptiste Darthenay) - Django template support
4. **ES7+ React/Redux/React-Native snippets** (dsznajder) - React snippets
5. **Auto Rename Tag** (Jun Han) - HTML/JSX tag renaming
6. **Bracket Pair Colorizer 2** (CoenraadS) - Bracket highlighting
7. **GitLens** (GitKraken) - Git integration
8. **Thunder Client** (RangaV) - API testing
9. **SQLite Viewer** (qwtel) - Database viewing
10. **Prettier** (Prettier) - Code formatting

### **Install Extensions via Command Palette**
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Extensions: Install Extensions"
3. Search and install each extension above

---

## 📁 Project Setup in VS Code

### **1. Open Project in VS Code**

#### **Method A: Clone from Repository (if available)**
```bash
git clone <repository-url>
cd maritime-platform-complete
code .
```

#### **Method B: Open Existing Project**
1. Open VS Code
2. File → Open Folder
3. Navigate to `maritime-platform-complete` folder
4. Click "Select Folder"

### **2. VS Code Workspace Configuration**

Create `.vscode/settings.json` in project root:
```json
{
    "python.defaultInterpreterPath": "./backend/venv/Scripts/python.exe",
    "python.terminal.activateEnvironment": true,
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "python.formatting.provider": "black",
    "python.analysis.extraPaths": ["./backend"],
    "emmet.includeLanguages": {
        "django-html": "html"
    },
    "files.associations": {
        "*.html": "django-html"
    },
    "terminal.integrated.cwd": "${workspaceFolder}",
    "eslint.workingDirectories": ["frontend"],
    "prettier.configPath": "./frontend/.prettierrc"
}
```

Create `.vscode/launch.json` for debugging:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Django Server",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/backend/manage.py",
            "args": ["runserver", "0.0.0.0:8000"],
            "django": true,
            "cwd": "${workspaceFolder}/backend",
            "env": {
                "DJANGO_SETTINGS_MODULE": "maritime_backend.settings"
            }
        },
        {
            "name": "React App",
            "type": "node",
            "request": "launch",
            "cwd": "${workspaceFolder}/frontend",
            "runtimeExecutable": "npm",
            "runtimeArgs": ["start"]
        }
    ],
    "compounds": [
        {
            "name": "Launch Full Stack",
            "configurations": ["Django Server", "React App"]
        }
    ]
}
```

Create `.vscode/tasks.json` for automated tasks:
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Install Backend Dependencies",
            "type": "shell",
            "command": "pip",
            "args": ["install", "-r", "requirements.txt"],
            "options": {
                "cwd": "${workspaceFolder}/backend"
            },
            "group": "build"
        },
        {
            "label": "Install Frontend Dependencies",
            "type": "shell",
            "command": "npm",
            "args": ["install"],
            "options": {
                "cwd": "${workspaceFolder}/frontend"
            },
            "group": "build"
        },
        {
            "label": "Django Migrations",
            "type": "shell",
            "command": "python",
            "args": ["manage.py", "migrate"],
            "options": {
                "cwd": "${workspaceFolder}/backend"
            },
            "group": "build"
        },
        {
            "label": "Start Backend Server",
            "type": "shell",
            "command": "python",
            "args": ["manage.py", "runserver", "0.0.0.0:8000"],
            "options": {
                "cwd": "${workspaceFolder}/backend"
            },
            "group": "build",
            "isBackground": true
        },
        {
            "label": "Start Frontend Server",
            "type": "shell",
            "command": "npm",
            "args": ["start"],
            "options": {
                "cwd": "${workspaceFolder}/frontend"
            },
            "group": "build",
            "isBackground": true
        }
    ]
}
```

---

## 🐍 Backend Setup (Django)

### **1. Open Integrated Terminal**
- Press `Ctrl+`` (backtick) or View → Terminal
- Make sure you're in the project root directory

### **2. Navigate to Backend Directory**
```bash
cd backend
```

### **3. Create Python Virtual Environment**
```bash
# Windows
python -m venv venv

# macOS/Linux
python3 -m venv venv
```

### **4. Activate Virtual Environment**
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### **5. Install Python Dependencies**
```bash
pip install django==4.2.7
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install python-decouple
```

Or if `requirements.txt` exists:
```bash
pip install -r requirements.txt
```

### **6. Configure VS Code Python Interpreter**
1. Press `Ctrl+Shift+P`
2. Type "Python: Select Interpreter"
3. Choose the interpreter from `./backend/venv/Scripts/python.exe`

### **7. Run Django Setup Commands**
```bash
# Create database tables
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Add sample data
python add_real_ships.py
python create_sample_voyages.py
python manage.py create_sample_notifications --count 25
```

### **8. Test Backend Server**
```bash
python manage.py runserver 0.0.0.0:8000
```

Visit `http://localhost:8000/api/` to verify the API is running.

---

## ⚛️ Frontend Setup (React)

### **1. Open New Terminal Tab**
- Click the `+` icon in terminal or press `Ctrl+Shift+``
- Navigate to frontend directory:
```bash
cd frontend
```

### **2. Install Node.js Dependencies**
```bash
npm install
```

This will install all dependencies listed in `package.json`:
- React and React DOM
- React Router
- Axios for API calls
- Recharts for data visualization
- React Leaflet for maps
- React Toastify for notifications

### **3. Configure Environment Variables**
Create `.env` file in frontend directory:
```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_VERSION=1.0.0
```

### **4. Test Frontend Server**
```bash
npm start
```

This will start the React development server on `http://localhost:3000`.

---

## 🚀 Running the Complete Project

### **Method 1: Using VS Code Tasks**
1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select "Start Backend Server"
4. Open another terminal and run "Start Frontend Server"

### **Method 2: Using VS Code Debugger**
1. Go to Run and Debug view (`Ctrl+Shift+D`)
2. Select "Launch Full Stack" from dropdown
3. Press F5 or click the green play button

### **Method 3: Manual Terminal Commands**

#### **Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
python manage.py runserver 0.0.0.0:8000
```

#### **Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

---

## 🔍 VS Code Development Features

### **1. Debugging Setup**

#### **Backend Debugging**
- Set breakpoints in Python files by clicking left of line numbers
- Use F5 to start debugging
- Variables, call stack, and watch windows available

#### **Frontend Debugging**
- Install "Debugger for Chrome" extension
- Set breakpoints in JavaScript/React files
- Use browser developer tools integration

### **2. Code Navigation**

#### **Python/Django Features**
- `Ctrl+Click` on functions/classes to go to definition
- `F12` for go to definition
- `Shift+F12` for find all references
- `Ctrl+Shift+O` for symbol search in file
- `Ctrl+T` for workspace symbol search

#### **React/JavaScript Features**
- Auto-completion for React components
- ES7+ snippets (type `rfc` for React functional component)
- Auto import suggestions
- JSX syntax highlighting

### **3. Integrated Git**
- Source Control view (`Ctrl+Shift+G`)
- Stage, commit, and push changes
- View file differences
- Branch management

### **4. Database Management**
- Use SQLite Viewer extension to browse `db.sqlite3`
- Right-click on database file → "Open Database"
- View tables, run queries, inspect data

---

## 🧪 Testing and API Development

### **1. API Testing with Thunder Client**
1. Install Thunder Client extension
2. Create new request
3. Test endpoints:
   - `POST http://localhost:8000/api/auth/login/`
   - `GET http://localhost:8000/api/vessels/`
   - `GET http://localhost:8000/api/analytics/dashboard/`

### **2. Django Admin Interface**
1. Create superuser: `python manage.py createsuperuser`
2. Visit `http://localhost:8000/admin/`
3. Login and manage data through web interface

### **3. React Developer Tools**
- Install React Developer Tools browser extension
- Inspect component hierarchy and props
- Debug React state and context

---

## 📊 Project Structure in VS Code

```
maritime-platform-complete/
├── .vscode/                    # VS Code configuration
│   ├── settings.json          # Editor settings
│   ├── launch.json            # Debug configuration
│   └── tasks.json             # Automated tasks
├── backend/                   # Django backend
│   ├── venv/                  # Python virtual environment
│   ├── maritime_backend/      # Main Django project
│   ├── authentication/        # User management app
│   ├── vessels/               # Vessel management app
│   ├── analytics/             # Analytics app
│   ├── notifications/         # Notifications app
│   ├── manage.py              # Django management script
│   └── db.sqlite3             # SQLite database
├── frontend/                  # React frontend
│   ├── node_modules/          # Node.js dependencies
│   ├── public/                # Static files
│   ├── src/                   # React source code
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   └── services/          # API services
│   ├── package.json           # Node.js dependencies
│   └── .env                   # Environment variables
└── README.md                  # Project documentation
```

---

## 🎯 VS Code Shortcuts for Maritime Platform

### **Essential Shortcuts**
- `Ctrl+`` - Toggle terminal
- `Ctrl+Shift+`` - New terminal
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+P` - Command palette
- `Ctrl+Shift+E` - Explorer view
- `Ctrl+Shift+D` - Debug view
- `Ctrl+Shift+G` - Source control
- `F5` - Start debugging
- `Ctrl+F5` - Run without debugging

### **Code Editing**
- `Alt+Up/Down` - Move line up/down
- `Shift+Alt+Up/Down` - Copy line up/down
- `Ctrl+/` - Toggle line comment
- `Shift+Alt+F` - Format document
- `Ctrl+D` - Select next occurrence
- `Ctrl+Shift+L` - Select all occurrences

---

## 🔧 Troubleshooting Common Issues

### **1. Python Virtual Environment Issues**
```bash
# If venv activation fails
python -m venv venv --clear
venv\Scripts\activate
pip install --upgrade pip
```

### **2. Node.js Dependency Issues**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **3. Port Already in Use**
```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **4. Database Issues**
```bash
# Reset database
cd backend
rm db.sqlite3
python manage.py migrate
python add_real_ships.py
```

### **5. VS Code Python Interpreter Issues**
1. Press `Ctrl+Shift+P`
2. Type "Python: Select Interpreter"
3. Choose the correct venv interpreter
4. Restart VS Code if needed

---

## 🎉 Success Verification

### **1. Backend Running Successfully**
- Terminal shows: "Starting development server at http://0.0.0.0:8000/"
- Visit `http://localhost:8000/api/` shows Django REST API page
- No error messages in terminal

### **2. Frontend Running Successfully**
- Terminal shows: "webpack compiled successfully"
- Visit `http://localhost:3000` shows Maritime Platform home page
- No console errors in browser developer tools

### **3. Full Integration Working**
- Can register/login users
- Can view vessel tracking with map
- Can access analytics with charts
- Can receive notifications
- All navigation links work

---

## 📚 Additional VS Code Tips

### **1. Workspace Recommendations**
Create `.vscode/extensions.json`:
```json
{
    "recommendations": [
        "ms-python.python",
        "ms-python.pylance",
        "batisteo.vscode-django",
        "dsznajder.es7-react-js-snippets",
        "formulahendry.auto-rename-tag",
        "coenraads.bracket-pair-colorizer-2",
        "eamodio.gitlens",
        "rangav.vscode-thunder-client",
        "qwtel.sqlite-viewer",
        "esbenp.prettier-vscode"
    ]
}
```

### **2. Code Snippets**
Create custom snippets for faster development:
- Django model snippets
- React component snippets
- API endpoint snippets

### **3. Multi-root Workspace**
Create `maritime-platform.code-workspace`:
```json
{
    "folders": [
        {
            "name": "Backend",
            "path": "./backend"
        },
        {
            "name": "Frontend", 
            "path": "./frontend"
        }
    ],
    "settings": {
        "python.defaultInterpreterPath": "./backend/venv/Scripts/python.exe"
    }
}
```

---

## 🚀 Ready to Develop!

After following this guide, you'll have:

✅ **Complete VS Code setup** with all necessary extensions
✅ **Backend Django server** running on http://localhost:8000
✅ **Frontend React app** running on http://localhost:3000
✅ **Database** populated with sample data
✅ **Debugging capabilities** for both frontend and backend
✅ **Integrated development environment** optimized for full-stack development

**Your Maritime Platform is now ready for development in VS Code!** 🚢⚓

### **Quick Start Commands:**
```bash
# Terminal 1 - Backend
cd backend && venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000

# Terminal 2 - Frontend  
cd frontend && npm start
```

**Open http://localhost:3000 and start exploring your Maritime Platform!** 🌊
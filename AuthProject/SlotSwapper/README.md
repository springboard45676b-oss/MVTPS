# SlotSwapper - ServiceHive Technical Challenge

SlotSwapper is a full-stack peer-to-peer time-slot scheduling application. Users can post their own busy calendar slots as "swappable" and request to swap them for other users' available slots.

This project was built to fulfill the requirements of the ServiceHive Full Stack Intern technical challenge.

## Tech Stack

* **Frontend:** React (Vite)
* **Backend:** Node.js, Express
* **Database:** SQLite
* **Authentication:** JSON Web Tokens (JWT) & bcrypt.js

---

## How to Run Locally

### Prerequisites

* Node.js (v18+)
* npm (v9+ or equivalent)

---

### 1. Setup the Backend (Server)

First, get the backend API running.

```bash
# 1. Clone the repository
git clone Akhila21-6
cd SlotSwapper

# 2. Move into the server directory
cd server

# 3. Install all required packages
npm install

# 4. Start the server
# This also creates the dev.db file and tables automatically.
node index.js
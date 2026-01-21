# 🚢 Maritime Vessel Tracking & Port Safety (MVTPS)

A full-stack maritime logistics dashboard designed to enhance port safety and operational efficiency. This system provides real-time visibility into vessel movements, port congestion, and regulatory compliance.

## 🚀 Key Features

* **Live Fleet Tracking:** Interactive map visualizing vessel positions, speed, and status in real-time.
* **Voyage Management:** Schedule tracking module for monitoring active vessel routes and ETAs.
* **Historical Replay Engine:** "Time-Travel" feature allowing operators to replay past vessel journeys to review incidents.
* **Compliance Audit:** Automated background system that flags safety violations (e.g., speeding, piracy zone entry) during replays.
* **Analytics Dashboard:** Dynamic charts analyzing Port Traffic (Arrivals vs. Departures) and Congestion Wait Times.
* **Role-Based Access:** Secure login for Admins and Operators using JWT Authentication.

## 🛠️ Tech Stack

* **Frontend:** React.js, Recharts, Leaflet Maps, Tailwind CSS
* **Backend:** Python, Django REST Framework
* **Database:** SQLite / PostgreSQL
* **Authentication:** JWT (JSON Web Tokens)

## 📦 How to Run

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Akhila21-6/MVTPS.git](https://github.com/Akhila21-6/MVTPS.git)
    ```
2.  **Backend Setup:**
    ```bash
    cd backend
    pip install -r requirements.txt
    python manage.py runserver
    ```
3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm start
    ```
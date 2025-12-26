import pandas as pd
import sqlite3
import logging

logging.basicConfig(level=logging.INFO)

def load_to_sqlite():
    """Load data to SQLite (no PostgreSQL needed)"""
    
    # Create SQLite database
    conn = sqlite3.connect('unctad_data.db')
    
    # Create table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS unctad_port_calls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        port_name TEXT NOT NULL,
        country TEXT NOT NULL,
        year INTEGER NOT NULL,
        port_calls INTEGER,
        avg_time_spent_hours REAL
    )
    ''')
    
    # Load CSV
    df = pd.read_csv('cleaned_US_PortCallsArrivals.csv')
    logging.info(f"Loading {len(df)} rows")
    
    # Insert data
    df.to_sql('unctad_port_calls', conn, if_exists='append', index=False)
    
    # Verify
    result = conn.execute('SELECT COUNT(*) FROM unctad_port_calls').fetchone()
    logging.info(f"Successfully inserted {result[0]} rows")
    
    conn.close()

if __name__ == "__main__":
    load_to_sqlite()
import psycopg2
import pandas as pd
from sqlalchemy import create_engine
import os

def create_postgresql_table():
    """
    Create PostgreSQL table for UNCTAD port calls data
    """
    
    # Database connection parameters
    DB_CONFIG = {
        'host': 'localhost',
        'database': 'mvtps_db',
        'user': 'postgres',
        'password': 'your_password',
        'port': 5432
    }
    
    # SQL to create table
    CREATE_TABLE_SQL = """
    CREATE TABLE IF NOT EXISTS unctad_port_calls (
        id SERIAL PRIMARY KEY,
        port_name VARCHAR(255) NOT NULL,
        country VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        port_calls BIGINT NOT NULL,
        avg_time_spent_hours FLOAT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_unctad_port_calls_country ON unctad_port_calls(country);
    CREATE INDEX IF NOT EXISTS idx_unctad_port_calls_year ON unctad_port_calls(year);
    CREATE INDEX IF NOT EXISTS idx_unctad_port_calls_port_name ON unctad_port_calls(port_name);
    """
    
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Create table
        cursor.execute(CREATE_TABLE_SQL)
        conn.commit()
        
        print("✅ Table 'unctad_port_calls' created successfully")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating table: {e}")
        return False

def load_csv_to_postgresql(csv_file):
    """
    Load cleaned CSV data into PostgreSQL table
    """
    
    DB_URL = "postgresql://postgres:your_password@localhost:5432/mvtps_db"
    
    try:
        # Read CSV file
        df = pd.read_csv(csv_file)
        print(f"Loading {len(df)} rows from {csv_file}")
        
        # Create SQLAlchemy engine
        engine = create_engine(DB_URL)
        
        # Load data to PostgreSQL
        df.to_sql(
            'unctad_port_calls',
            engine,
            if_exists='append',
            index=False,
            method='multi'
        )
        
        print(f"✅ Data loaded successfully from {csv_file}")
        
    except Exception as e:
        print(f"❌ Error loading data: {e}")

def main():
    """
    Main function to create table and load data
    """
    print("Creating PostgreSQL table for UNCTAD port calls...")
    
    # Create table
    if create_postgresql_table():
        
        # Look for cleaned CSV files
        csv_files = [f for f in os.listdir('.') if f.startswith('cleaned_') and f.endswith('.csv')]
        
        if csv_files:
            print(f"\nFound cleaned CSV files: {csv_files}")
            
            for csv_file in csv_files:
                load_csv_to_postgresql(csv_file)
        else:
            print("No cleaned CSV files found. Run the cleaning script first.")

if __name__ == "__main__":
    main()
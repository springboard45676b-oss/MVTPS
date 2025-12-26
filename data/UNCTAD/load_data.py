import pandas as pd
import psycopg2
import numpy as np
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_load.log'),
        logging.StreamHandler()
    ]
)

def load_csv_to_postgres():
    """
    Load cleaned CSV data into PostgreSQL with validation and error handling
    """
    
    # Database configuration - UPDATE THESE VALUES
    DB_CONFIG = {
        'host': 'localhost',
        'database': 'postgres',  # Default database
        'user': 'postgres',
        'password': 'password',  # Change this to your actual password
        'port': 5432
    }
    
    csv_file = 'cleaned_US_PortCallsArrivals.csv'
    
    try:
        # 1. Load CSV file
        logging.info(f"Loading CSV file: {csv_file}")
        df = pd.read_csv(csv_file)
        logging.info(f"Loaded {len(df)} rows from CSV")
        
        # 2. Data validation and cleaning
        logging.info("Starting data validation...")
        
        # Skip rows where year is missing
        initial_count = len(df)
        df = df.dropna(subset=['year'])
        year_filtered_count = len(df)
        logging.info(f"Removed {initial_count - year_filtered_count} rows with missing year")
        
        # Validate year is integer
        df['year'] = pd.to_numeric(df['year'], errors='coerce')
        df = df.dropna(subset=['year'])
        df['year'] = df['year'].astype(int)
        
        # Validate port_calls is numeric, replace NaN with None (NULL)
        df['port_calls'] = pd.to_numeric(df['port_calls'], errors='coerce')
        
        # Replace NaN values with None for NULL insertion
        df = df.where(pd.notnull(df), None)
        
        # Validate required fields
        df = df.dropna(subset=['port_name', 'country'])
        
        valid_count = len(df)
        logging.info(f"After validation: {valid_count} valid rows remaining")
        
        if valid_count == 0:
            logging.warning("No valid rows to insert")
            return
        
        # 3. Connect to PostgreSQL
        logging.info("Connecting to PostgreSQL...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # 4. Prepare insert statement
        insert_sql = """
        INSERT INTO unctad_port_calls 
        (port_name, country, year, port_calls, avg_time_spent_hours)
        VALUES (%s, %s, %s, %s, %s)
        """
        
        # 5. Insert data in batches for better performance
        batch_size = 1000
        successful_inserts = 0
        failed_inserts = 0
        
        logging.info(f"Inserting data in batches of {batch_size}...")
        
        for i in range(0, len(df), batch_size):
            batch = df.iloc[i:i+batch_size]
            batch_data = []
            
            for _, row in batch.iterrows():
                try:
                    # Prepare row data
                    row_data = (
                        row['port_name'],
                        row['country'],
                        int(row['year']) if row['year'] is not None else None,
                        int(row['port_calls']) if row['port_calls'] is not None else None,
                        float(row['avg_time_spent_hours']) if row['avg_time_spent_hours'] is not None else None
                    )
                    batch_data.append(row_data)
                    
                except Exception as e:
                    logging.warning(f"Skipping invalid row: {e}")
                    failed_inserts += 1
                    continue
            
            # Execute batch insert
            try:
                cursor.executemany(insert_sql, batch_data)
                conn.commit()
                successful_inserts += len(batch_data)
                logging.info(f"Inserted batch {i//batch_size + 1}: {len(batch_data)} rows")
                
            except Exception as e:
                conn.rollback()
                logging.error(f"Error inserting batch {i//batch_size + 1}: {e}")
                failed_inserts += len(batch_data)
        
        # 6. Log results
        logging.info(f"Data loading completed:")
        logging.info(f"  - Successfully inserted: {successful_inserts} rows")
        logging.info(f"  - Failed inserts: {failed_inserts} rows")
        logging.info(f"  - Total processed: {successful_inserts + failed_inserts} rows")
        
        # Verify insertion
        cursor.execute("SELECT COUNT(*) FROM unctad_port_calls")
        total_rows = cursor.fetchone()[0]
        logging.info(f"Total rows in table: {total_rows}")
        
        cursor.close()
        conn.close()
        
        return successful_inserts
        
    except FileNotFoundError:
        logging.error(f"CSV file not found: {csv_file}")
        return 0
        
    except psycopg2.Error as e:
        logging.error(f"PostgreSQL error: {e}")
        return 0
        
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return 0

def verify_data_quality():
    """
    Verify data quality after insertion
    """
    DB_CONFIG = {
        'host': 'localhost',
        'database': 'mvtps_db',
        'user': 'postgres',
        'password': 'your_password',
        'port': 5432
    }
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Data quality checks
        checks = [
            ("Total records", "SELECT COUNT(*) FROM unctad_port_calls"),
            ("Records with NULL port_calls", "SELECT COUNT(*) FROM unctad_port_calls WHERE port_calls IS NULL"),
            ("Unique countries", "SELECT COUNT(DISTINCT country) FROM unctad_port_calls"),
            ("Year range", "SELECT MIN(year), MAX(year) FROM unctad_port_calls WHERE year IS NOT NULL"),
            ("Average port calls", "SELECT AVG(port_calls) FROM unctad_port_calls WHERE port_calls IS NOT NULL")
        ]
        
        logging.info("Data Quality Report:")
        logging.info("=" * 40)
        
        for check_name, query in checks:
            cursor.execute(query)
            result = cursor.fetchone()
            logging.info(f"{check_name}: {result}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        logging.error(f"Error in data quality check: {e}")

def main():
    """
    Main execution function
    """
    logging.info("Starting UNCTAD data loading process...")
    
    # Load data
    inserted_rows = load_csv_to_postgres()
    
    if inserted_rows > 0:
        logging.info("Data loading successful. Running quality checks...")
        verify_data_quality()
    else:
        logging.error("Data loading failed or no data inserted")
    
    logging.info("Process completed.")

if __name__ == "__main__":
    main()
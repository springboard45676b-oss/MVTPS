import pandas as pd
import numpy as np
import os

def clean_unctad_data(input_file, output_file):
    """
    Clean UNCTAD port call and performance statistics CSV data
    """
    try:
        # Load the CSV file
        print(f"Loading data from {input_file}...")
        df = pd.read_csv(input_file)
        
        print(f"Original data shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        
        # Display first few rows to understand structure
        print("\nFirst 5 rows:")
        print(df.head())
        
        # Remove rows with missing port name or year
        print("\nRemoving rows with missing port name or year...")
        
        # Find columns that likely contain port name (case insensitive)
        port_name_cols = [col for col in df.columns if 'port' in col.lower() and 'name' in col.lower()]
        if not port_name_cols:
            port_name_cols = [col for col in df.columns if 'port' in col.lower()]
        if not port_name_cols:
            port_name_cols = [col for col in df.columns if 'name' in col.lower()]
        
        # Find year column
        year_cols = [col for col in df.columns if 'year' in col.lower()]
        if not year_cols:
            year_cols = [col for col in df.columns if any(str(y) in str(col) for y in range(2000, 2030))]
        
        print(f"Detected port name columns: {port_name_cols}")
        print(f"Detected year columns: {year_cols}")
        
        # Use first detected columns or ask user to specify
        port_name_col = port_name_cols[0] if port_name_cols else input("Enter port name column: ")
        year_col = year_cols[0] if year_cols else input("Enter year column: ")
        
        # Remove rows with missing values in key columns
        initial_rows = len(df)
        df = df.dropna(subset=[port_name_col, year_col])
        print(f"Removed {initial_rows - len(df)} rows with missing port name or year")
        
        # Find other required columns
        country_cols = [col for col in df.columns if 'country' in col.lower()]
        calls_cols = [col for col in df.columns if 'call' in col.lower() and ('number' in col.lower() or 'count' in col.lower())]
        time_cols = [col for col in df.columns if 'time' in col.lower() and ('spent' in col.lower() or 'port' in col.lower())]
        
        print(f"Detected country columns: {country_cols}")
        print(f"Detected port calls columns: {calls_cols}")
        print(f"Detected time spent columns: {time_cols}")
        
        # Select columns or use defaults
        country_col = country_cols[0] if country_cols else None
        calls_col = calls_cols[0] if calls_cols else None
        time_col = time_cols[0] if time_cols else None
        
        # Create cleaned dataframe with selected columns
        columns_to_keep = {
            'port_name': port_name_col,
            'year': year_col
        }
        
        if country_col:
            columns_to_keep['country'] = country_col
        if calls_col:
            columns_to_keep['port_calls'] = calls_col
        if time_col:
            columns_to_keep['time_spent_port'] = time_col
        
        # Select and rename columns
        df_clean = df[list(columns_to_keep.values())].copy()
        df_clean.columns = list(columns_to_keep.keys())
        
        # Convert time spent in port to hours if it exists
        if 'time_spent_port' in df_clean.columns:
            print("Converting time spent in port to hours...")
            
            # Try to detect time unit and convert to hours
            time_values = df_clean['time_spent_port'].dropna()
            
            # Check if values are already in hours (reasonable range)
            if time_values.max() <= 168:  # Less than a week
                print("Time appears to be in hours already")
                df_clean['time_spent_hours'] = df_clean['time_spent_port']
            elif time_values.max() <= 10080:  # Less than a week in minutes
                print("Converting from minutes to hours")
                df_clean['time_spent_hours'] = df_clean['time_spent_port'] / 60
            elif time_values.max() <= 604800:  # Less than a week in seconds
                print("Converting from seconds to hours")
                df_clean['time_spent_hours'] = df_clean['time_spent_port'] / 3600
            else:
                print("Time unit unclear, keeping original values")
                df_clean['time_spent_hours'] = df_clean['time_spent_port']
            
            # Remove original time column and rename
            df_clean = df_clean.drop('time_spent_port', axis=1)
            df_clean = df_clean.rename(columns={'time_spent_hours': 'time_spent_port_hours'})
        
        # Clean data types
        if 'year' in df_clean.columns:
            df_clean['year'] = pd.to_numeric(df_clean['year'], errors='coerce')
        if 'port_calls' in df_clean.columns:
            df_clean['port_calls'] = pd.to_numeric(df_clean['port_calls'], errors='coerce')
        if 'time_spent_port_hours' in df_clean.columns:
            df_clean['time_spent_port_hours'] = pd.to_numeric(df_clean['time_spent_port_hours'], errors='coerce')
        
        # Remove any remaining rows with NaN in critical columns
        df_clean = df_clean.dropna(subset=['port_name', 'year'])
        
        print(f"\nCleaned data shape: {df_clean.shape}")
        print(f"Final columns: {list(df_clean.columns)}")
        
        # Display summary statistics
        print("\nSummary statistics:")
        print(df_clean.describe())
        
        # Save cleaned data
        df_clean.to_csv(output_file, index=False)
        print(f"\nCleaned data saved to: {output_file}")
        
        return df_clean
        
    except Exception as e:
        print(f"Error processing data: {e}")
        return None

def main():
    """
    Main function to process UNCTAD data
    """
    # Set data directory
    data_dir = "MVTPS/data/UNCTAD"
    
    # Look for CSV files in the directory
    csv_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
    
    if not csv_files:
        print("No CSV files found in MVTPS/data/UNCTAD directory")
        return
    
    print(f"Found CSV files: {csv_files}")
    
    # Process each CSV file
    for csv_file in csv_files:
        input_path = os.path.join(data_dir, csv_file)
        output_path = os.path.join(data_dir, f"cleaned_{csv_file}")
        
        print(f"\n{'='*50}")
        print(f"Processing: {csv_file}")
        print(f"{'='*50}")
        
        cleaned_data = clean_unctad_data(input_path, output_path)
        
        if cleaned_data is not None:
            print(f"Successfully processed {csv_file}")
            
            # Display sample of cleaned data
            print("\nSample of cleaned data:")
            print(cleaned_data.head(10))
        else:
            print(f"Failed to process {csv_file}")

if __name__ == "__main__":
    main()
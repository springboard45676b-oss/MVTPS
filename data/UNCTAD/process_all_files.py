import pandas as pd
import os

def process_all_csv_files():
    """Process all CSV files in the directory"""
    
    # Get all CSV files (excluding already cleaned ones)
    csv_files = [f for f in os.listdir('.') 
                 if f.endswith('.csv') and not f.startswith('cleaned_')]
    
    print(f"Found CSV files to process: {csv_files}")
    
    for csv_file in csv_files:
        try:
            print(f"\n{'='*50}")
            print(f"Processing: {csv_file}")
            print(f"{'='*50}")
            
            # Load and examine the file
            df = pd.read_csv(csv_file)
            print(f"Shape: {df.shape}")
            print("Columns:", list(df.columns))
            print("\nFirst 3 rows:")
            print(df.head(3))
            
            # Clean the data based on file type
            if 'arrival' in csv_file.lower():
                cleaned_df = clean_arrivals_data(df)
            elif 'call' in csv_file.lower():
                cleaned_df = clean_calls_data(df)
            else:
                cleaned_df = clean_generic_data(df)
            
            # Save cleaned file
            output_file = f"cleaned_{csv_file}"
            cleaned_df.to_csv(output_file, index=False)
            print(f"Saved: {output_file}")
            print(f"Cleaned shape: {cleaned_df.shape}")
            
        except Exception as e:
            print(f"Error processing {csv_file}: {e}")

def clean_arrivals_data(df):
    """Clean arrivals data"""
    # Remove empty rows
    df = df.dropna(subset=['Number of port calls'])
    df = df[df['Number of port calls'] != '']
    
    # Remove summary rows
    df = df[df['Economy'] != '0001']
    
    # Keep relevant columns
    df_clean = df[['Year', 'Economy Label', 'Number of port calls']].copy()
    df_clean.columns = ['year', 'country', 'port_calls']
    
    # Convert to numeric
    df_clean['year'] = pd.to_numeric(df_clean['year'])
    df_clean['port_calls'] = pd.to_numeric(df_clean['port_calls'])
    
    # Add port names and time estimates
    df_clean['port_name'] = df_clean['country'].apply(get_main_port)
    df_clean['avg_time_spent_hours'] = 36.0
    
    return df_clean[['port_name', 'country', 'year', 'port_calls', 'avg_time_spent_hours']]

def clean_calls_data(df):
    """Clean port calls data"""
    # Similar cleaning logic for port calls
    return clean_arrivals_data(df)  # Use same logic for now

def clean_generic_data(df):
    """Clean generic CSV data"""
    # Basic cleaning for unknown format
    return df.dropna()

def get_main_port(country):
    """Map country to main port"""
    port_mapping = {
        'Australia': 'Port of Sydney',
        'Canada': 'Port of Vancouver',
        'China': 'Port of Shanghai',
        'Croatia': 'Port of Rijeka',
        'Denmark': 'Port of Copenhagen',
        'France': 'Port of Le Havre',
        'Germany': 'Port of Hamburg',
        'Greece': 'Port of Piraeus',
        'Indonesia': 'Port of Jakarta',
        'Italy': 'Port of Genoa',
        'Japan': 'Port of Tokyo',
        'Korea, Republic of': 'Port of Busan',
        'Netherlands (Kingdom of the)': 'Port of Rotterdam',
        'Norway': 'Port of Oslo',
        'Philippines': 'Port of Manila',
        'Russian Federation': 'Port of St. Petersburg',
        'Spain': 'Port of Barcelona',
        'United States': 'Port of Los Angeles'
    }
    return port_mapping.get(country, f'Port of {country}')

if __name__ == "__main__":
    process_all_csv_files()
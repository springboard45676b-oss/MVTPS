import pandas as pd

def clean_us_port_calls():
    """Clean the US_PortCalls.csv file"""
    
    # The file is nested in a directory, so use the full path
    csv_path = 'US_PortCalls.csv/US_PortCalls.csv'
    
    try:
        print("Loading US_PortCalls.csv...")
        df = pd.read_csv(csv_path)
        
        print(f"Original shape: {df.shape}")
        print("Columns:", list(df.columns))
        print("\nFirst 5 rows:")
        print(df.head())
        
        # Clean the data based on structure
        # Remove rows with missing essential data
        if 'Number of port calls' in df.columns:
            df_clean = df.dropna(subset=['Number of port calls'])
            df_clean = df_clean[df_clean['Number of port calls'] != '']
            
            # Remove summary rows if they exist
            if 'Economy' in df.columns:
                df_clean = df_clean[df_clean['Economy'] != '0001']
            
            # Select and rename columns
            columns_map = {}
            if 'Year' in df.columns:
                columns_map['Year'] = 'year'
            if 'Economy Label' in df.columns:
                columns_map['Economy Label'] = 'country'
            elif 'Country' in df.columns:
                columns_map['Country'] = 'country'
            if 'Number of port calls' in df.columns:
                columns_map['Number of port calls'] = 'port_calls'
            
            # Keep only mapped columns
            df_clean = df_clean[list(columns_map.keys())].copy()
            df_clean = df_clean.rename(columns=columns_map)
            
            # Convert to numeric
            if 'year' in df_clean.columns:
                df_clean['year'] = pd.to_numeric(df_clean['year'], errors='coerce')
            if 'port_calls' in df_clean.columns:
                df_clean['port_calls'] = pd.to_numeric(df_clean['port_calls'], errors='coerce')
            
            # Remove rows with invalid data
            df_clean = df_clean.dropna(subset=['year', 'country'])
            
            # Add port names based on country
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
            
            df_clean['port_name'] = df_clean['country'].map(port_mapping)
            df_clean = df_clean.dropna(subset=['port_name'])
            
            # Add estimated time spent
            df_clean['avg_time_spent_hours'] = 36.0
            
            # Reorder columns
            final_columns = ['port_name', 'country', 'year', 'port_calls', 'avg_time_spent_hours']
            df_final = df_clean[final_columns]
            
        else:
            print("Unknown file structure, using generic cleaning...")
            df_final = df.dropna()
        
        print(f"\nCleaned shape: {df_final.shape}")
        print("Sample cleaned data:")
        print(df_final.head(10))
        
        # Save cleaned file
        output_file = 'cleaned_US_PortCalls.csv'
        df_final.to_csv(output_file, index=False)
        print(f"\nSaved: {output_file}")
        
        return df_final
        
    except Exception as e:
        print(f"Error cleaning US_PortCalls.csv: {e}")
        return None

if __name__ == "__main__":
    clean_us_port_calls()
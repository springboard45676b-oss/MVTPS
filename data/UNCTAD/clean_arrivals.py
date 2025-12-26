import pandas as pd

def clean_unctad_arrivals():
    # Load the CSV file
    df = pd.read_csv('US_PortCallsArrivals.csv')
    
    print(f"Original shape: {df.shape}")
    print("Columns:", list(df.columns))
    
    # Remove rows with missing data
    df_clean = df.dropna(subset=['Number of port calls'])
    df_clean = df_clean[df_clean['Number of port calls'] != '']
    
    # Remove summary rows (Economy code 0001)
    df_clean = df_clean[df_clean['Economy'] != '0001']
    
    # Keep only relevant columns and rename
    df_clean = df_clean[['Year', 'Economy Label', 'CommercialMarket Label', 'Number of port calls']].copy()
    df_clean.columns = ['year', 'country', 'ship_type', 'port_calls']
    
    # Convert to numeric
    df_clean['year'] = pd.to_numeric(df_clean['year'])
    df_clean['port_calls'] = pd.to_numeric(df_clean['port_calls'])
    
    # Aggregate by country and year (sum all ship types)
    df_aggregated = df_clean.groupby(['year', 'country']).agg({
        'port_calls': 'sum'
    }).reset_index()
    
    # Add estimated time spent (mock data since not available)
    # Assume average 24-48 hours per port call
    df_aggregated['avg_time_spent_hours'] = 36.0  # Average 36 hours
    
    # Add port_name as country's main port
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
        'Spain': 'Port of Barcelona'
    }
    
    df_aggregated['port_name'] = df_aggregated['country'].map(port_mapping)
    df_aggregated = df_aggregated.dropna(subset=['port_name'])
    
    # Reorder columns
    df_final = df_aggregated[['port_name', 'country', 'year', 'port_calls', 'avg_time_spent_hours']]
    
    print(f"Cleaned shape: {df_final.shape}")
    print("Sample data:")
    print(df_final.head(10))
    
    # Save cleaned file
    output_file = 'cleaned_US_PortCallsArrivals_new.csv'
    df_final.to_csv(output_file, index=False)
    print(f"Saved: {output_file}")
    
    return df_final

if __name__ == "__main__":
    clean_unctad_arrivals()
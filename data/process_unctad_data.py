#!/usr/bin/env python3
"""
UNCTAD Port Calls Data Processing Script
Processes the US_PortCallsArrivals.csv data for the MVTPS platform
"""

import pandas as pd
import json
from pathlib import Path

def load_and_clean_data():
    """Load and clean the UNCTAD port calls data"""
    
    # Load the CSV file
    data_path = Path(__file__).parent / 'UNCTAD' / 'US_PortCallsArrivals.csv'
    df = pd.read_csv(data_path)
    
    # Clean the data
    # Remove rows where port calls data is missing or not applicable
    df_clean = df[
        (df['Number of port calls'].notna()) & 
        (df['Number of port calls'] != '') &
        (~df['Number of port calls Missing value'].str.contains('Not applicable|Not publishable|Not available', na=False))
    ].copy()
    
    # Convert port calls to numeric
    df_clean['Number of port calls'] = pd.to_numeric(df_clean['Number of port calls'], errors='coerce')
    
    # Filter out summary rows (keep individual economies only)
    individual_economies = df_clean[df_clean['Economy'] > 100].copy()  # Individual country codes are > 100
    
    return individual_economies

def get_top_countries_by_traffic(df, year=2021, top_n=20):
    """Get top countries by total port calls for a specific year"""
    
    year_data = df[
        (df['Year'] == year) & 
        (df['CommercialMarket'] == '00')  # All ships
    ].copy()
    
    top_countries = year_data.nlargest(top_n, 'Number of port calls')[
        ['Economy Label', 'Number of port calls']
    ]
    
    return top_countries

def get_ship_type_distribution(df, country='United States of America', year=2021):
    """Get ship type distribution for a specific country and year"""
    
    country_data = df[
        (df['Year'] == year) & 
        (df['Economy Label'] == country) &
        (df['CommercialMarket'] != '00')  # Exclude 'All ships' category
    ].copy()
    
    return country_data[['CommercialMarket Label', 'Number of port calls']]

def generate_port_analytics_data(df):
    """Generate analytics data for the MVTPS dashboard"""
    
    analytics = {}
    
    # Global statistics for latest year (2021)
    latest_year = df['Year'].max()
    latest_data = df[df['Year'] == latest_year]
    
    # Total global port calls
    global_total = latest_data[
        (latest_data['Economy'] == 0) & 
        (latest_data['CommercialMarket'] == '00')
    ]['Number of port calls'].iloc[0] if len(latest_data[
        (latest_data['Economy'] == 0) & 
        (latest_data['CommercialMarket'] == '00')
    ]) > 0 else 0
    
    analytics['global_stats'] = {
        'total_port_calls_2021': int(global_total) if pd.notna(global_total) else 0,
        'year': latest_year
    }
    
    # Top 10 countries by port calls
    top_countries = get_top_countries_by_traffic(df, latest_year, 10)
    analytics['top_countries'] = top_countries.to_dict('records')
    
    # Ship type distribution globally
    global_ship_types = latest_data[
        (latest_data['Economy'] == 0) & 
        (latest_data['CommercialMarket'] != '00')
    ][['CommercialMarket Label', 'Number of port calls']].to_dict('records')
    
    analytics['global_ship_types'] = global_ship_types
    
    # Year-over-year trends for major economies
    major_economies = ['United States of America', 'China', 'Japan', 'Germany', 'United Kingdom']
    trends = {}
    
    for economy in major_economies:
        economy_trend = df[
            (df['Economy Label'] == economy) & 
            (df['CommercialMarket'] == '00')
        ][['Year', 'Number of port calls']].to_dict('records')
        trends[economy] = economy_trend
    
    analytics['trends'] = trends
    
    return analytics

def export_for_mvtps(df):
    """Export processed data in formats suitable for MVTPS"""
    
    output_dir = Path(__file__).parent / 'processed'
    output_dir.mkdir(exist_ok=True)
    
    # Generate analytics data
    analytics = generate_port_analytics_data(df)
    
    # Save as JSON for frontend consumption
    with open(output_dir / 'port_analytics.json', 'w') as f:
        json.dump(analytics, f, indent=2, default=str)
    
    # Save cleaned CSV for further analysis
    df.to_csv(output_dir / 'cleaned_port_calls.csv', index=False)
    
    # Create summary statistics
    summary = {
        'total_records': len(df),
        'years_covered': sorted(df['Year'].unique().tolist()),
        'countries_count': df['Economy Label'].nunique(),
        'ship_types': df['CommercialMarket Label'].unique().tolist()
    }
    
    with open(output_dir / 'data_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"✅ Data processed and exported to {output_dir}")
    print(f"📊 {summary['total_records']} records processed")
    print(f"🌍 {summary['countries_count']} countries/regions")
    print(f"📅 Years: {summary['years_covered']}")
    
    return analytics

def main():
    """Main processing function"""
    print("🚢 Processing UNCTAD Port Calls Data for MVTPS...")
    
    # Load and clean data
    df = load_and_clean_data()
    print(f"📈 Loaded {len(df)} records")
    
    # Export processed data
    analytics = export_for_mvtps(df)
    
    # Display some key insights
    print("\n📋 Key Insights:")
    print(f"Global Port Calls (2021): {analytics['global_stats']['total_port_calls_2021']:,}")
    
    print("\n🏆 Top 5 Countries by Port Calls (2021):")
    for i, country in enumerate(analytics['top_countries'][:5], 1):
        print(f"{i}. {country['Economy Label']}: {country['Number of port calls']:,}")
    
    return analytics

if __name__ == "__main__":
    analytics = main()
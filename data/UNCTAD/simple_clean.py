import pandas as pd
import os

# Simple UNCTAD data cleaning script
def clean_unctad_csv():
    try:
        # Get all CSV files in current directory
        csv_files = [f for f in os.listdir('.') if f.endswith('.csv') and not f.startswith('cleaned_')]
        
        if not csv_files:
            print("No CSV files found in current directory")
            return
        
        for csv_file in csv_files:
            print(f"Processing: {csv_file}")
            
            try:
                # Load CSV with error handling
                df = pd.read_csv(csv_file, encoding='utf-8')
            except UnicodeDecodeError:
                try:
                    df = pd.read_csv(csv_file, encoding='latin-1')
                except:
                    print(f"Error reading {csv_file} - skipping")
                    continue
            except PermissionError:
                print(f"Permission denied for {csv_file} - file may be open in Excel")
                continue
            except Exception as e:
                print(f"Error reading {csv_file}: {e}")
                continue
        print(f"Original shape: {df.shape}")
        
        # Show columns for user reference
        print("Available columns:")
        for i, col in enumerate(df.columns):
            print(f"{i}: {col}")
        
        # Auto-detect or manually specify columns
        # Common UNCTAD column patterns
        port_col = None
        country_col = None
        year_col = None
        calls_col = None
        time_col = None
        
        for col in df.columns:
            col_lower = col.lower()
            if 'port' in col_lower and ('name' in col_lower or col_lower == 'port'):
                port_col = col
            elif 'country' in col_lower:
                country_col = col
            elif 'year' in col_lower:
                year_col = col
            elif 'call' in col_lower and 'number' in col_lower:
                calls_col = col
            elif 'time' in col_lower and ('spent' in col_lower or 'port' in col_lower):
                time_col = col
        
        print(f"Detected - Port: {port_col}, Country: {country_col}, Year: {year_col}")
        print(f"Detected - Calls: {calls_col}, Time: {time_col}")
        
        # Create cleaned dataframe
        keep_cols = []
        rename_map = {}
        
        if port_col:
            keep_cols.append(port_col)
            rename_map[port_col] = 'port_name'
        if country_col:
            keep_cols.append(country_col)
            rename_map[country_col] = 'country'
        if year_col:
            keep_cols.append(year_col)
            rename_map[year_col] = 'year'
        if calls_col:
            keep_cols.append(calls_col)
            rename_map[calls_col] = 'port_calls'
        if time_col:
            keep_cols.append(time_col)
            rename_map[time_col] = 'time_spent_port'
        
        # Filter and clean data
        df_clean = df[keep_cols].copy()
        df_clean = df_clean.rename(columns=rename_map)
        
        # Remove rows with missing port name or year
        if 'port_name' in df_clean.columns and 'year' in df_clean.columns:
            df_clean = df_clean.dropna(subset=['port_name', 'year'])
        
        # Convert time to hours if exists
        if 'time_spent_port' in df_clean.columns:
            # Assume days and convert to hours
            df_clean['time_spent_port_hours'] = pd.to_numeric(df_clean['time_spent_port'], errors='coerce') * 24
            df_clean = df_clean.drop('time_spent_port', axis=1)
        
        # Clean numeric columns
        for col in ['year', 'port_calls', 'time_spent_port_hours']:
            if col in df_clean.columns:
                df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
        
        print(f"Cleaned shape: {df_clean.shape}")
        
        # Save cleaned file
        try:
            output_file = f"cleaned_{csv_file}"
            df_clean.to_csv(output_file, index=False)
            print(f"Saved: {output_file}")
            print(f"Columns: {list(df_clean.columns)}")
            print("Sample data:")
            print(df_clean.head())
        except PermissionError:
            print(f"Cannot save {output_file} - file may be open")
        except Exception as e:
            print(f"Error saving file: {e}")
        
        print("-" * 50)
    
    except Exception as e:
        print(f"General error: {e}")

if __name__ == "__main__":
    clean_unctad_csv()
import pandas as pd
import os

def check_csv_columns():
    csv_files = [f for f in os.listdir('.') if f.endswith('.csv')]
    
    print("CSV Files Found:")
    for i, file in enumerate(csv_files):
        print(f"{i+1}. {file}")
    
    print("\n" + "="*50)
    
    for csv_file in csv_files:
        try:
            df = pd.read_csv(csv_file)
            print(f"\nFile: {csv_file}")
            print(f"Shape: {df.shape}")
            print("Columns:")
            for i, col in enumerate(df.columns):
                print(f"  {i+1}. {col}")
            
            # Show first few rows
            print("\nFirst 3 rows:")
            print(df.head(3))
            print("-" * 50)
            
        except Exception as e:
            print(f"Error reading {csv_file}: {e}")

if __name__ == "__main__":
    check_csv_columns()
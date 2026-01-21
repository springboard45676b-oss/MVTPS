import streamlit as st
import pandas as pd
from pandasai import SmartDataframe
from pandasai.llm import GooglePalm  # <-- This is the fix for the 'Gemini' import error

# --- 1. Setup your LLM ---
# PASTE YOUR API KEY HERE:
# THE FIX:
GOOGLE_API_KEY = "AIzaSyD4B_Jz9yyfDdXz7fchzXr5OQ-p1w0ilDs"

# This line uses the variable defined above (Fixes the NameError)
llm = GooglePalm(api_key=GOOGLE_API_KEY)


# --- 2. Load your (manually downloaded) data ---
# Make sure these CSV files are in the same folder
try:
    crop_df = pd.read_csv("district_crop_production.csv")
    rainfall_df = pd.read_csv("rainfall_data.csv")
except FileNotFoundError:
    st.error("Error: Make sure 'district_crop_production.csv' and 'rainfall_data.csv' are in the same folder as app.py.")
    st.stop()

# --- 3. Create the "Smart" DataFrames ---
# This is where we tell the AI how the two files are related.
smart_df = SmartDataframe(
    [crop_df, rainfall_df],
    config={
        "llm": llm,
        "description": """
        You are a data analyst for the Indian government.
        You have two dataframes:
        1. crop_df: Contains crop production data by district, state, crop, and year.
        2. rainfall_df: Contains rainfall data by 'METEOROLOGICAL SUB-DIVISION' and year.

        CRITICAL MAPPING: The 'METEOROLOGICAL SUB-DIVISION' in rainfall_df 
        is the same as the 'State' in crop_df.
        """
    }
)

# --- 4. Build the Streamlit App ---
st.title("🇮🇳 Project Samarth: Agri-Climate Q&A")
st.write("Ask a question about crop production and rainfall in India.")

# Get user question
user_question = st.text_input("Your question:")

if st.button("Get Answer"):
    if user_question:
        with st.spinner("Analyzing data and generating response..."):
            try:
                # This is where PandasAI runs the query
                response = smart_df.chat(user_question)
                
                st.subheader("Answer:")
                st.write(response)

                # For the "Traceability" requirement
                st.subheader("Data Sources Used:")
                st.caption("district_crop_production.csv, rainfall_data.csv (from data.gov.in)")

            except Exception as e:
                st.error(f"Sorry, I couldn't answer that. Error: {e}")
    else:
        st.warning("Please ask a question.")
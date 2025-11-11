# --- Import Necessary Libraries ---
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# --- Step 1: Load the Data ---
# Load the dataset you downloaded from Kaggle
file_path = 'loan_approval.csv' # Make sure this file is in the same folder as your script
df = pd.read_csv(file_path)

print("--- Data Head ---")
print(df.head())
print("\n--- Data Info ---")
df.info()


# --- Step 2: Data Preprocessing ---
print("\n--- Preprocessing ---")

# Check for missing values
print(f"Missing values count:\n{df.isnull().sum()}")

# **FIX 1: Use the correct column names 'name' and 'city'**
# We will drop them to simplify.
df = df.drop(columns=["name", "city"])

# **FIX 2: Convert the 'loan_approved' boolean (True/False) to int (1/0)**
df['loan_approved'] = df['loan_approved'].astype(int)

print("Preprocessing complete. Target variable converted to 1 (Approved) and 0 (Rejected).")
print(f"Cleaned data head:\n{df.head()}")


# --- Step 3: Model Selection and Development ---
print("\n--- Model Training ---")

# **FIX 3: Use the correct feature names**
# Define our features (X) and our target (y)
features = ['income', 'credit_score', 'loan_amount', 'years_employed', 'points']
X = df[features]
y = df['loan_approved']

# Split the data into training and testing sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# We will use Logistic Regression, a simple and effective classification model.
model = LogisticRegression()

# Train the model
model.fit(X_train, y_train)

print("Model training complete.")


# --- Step 4: Visualizations and Insights (Model Evaluation) ---
print("\n--- Model Evaluation & Insights ---")

# Make predictions on the test data
y_pred = model.predict(X_test)

# 1. Check Accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# 2. Print Classification Report (Precision, Recall, F1-score)
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Rejected (0)', 'Approved (1)']))

# 3. Create Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
print("\nConfusion Matrix:")
print(cm)

# VISUALIZATION 1: Confusion Matrix Heatmap
# (Save this plot for your PDF)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=['Predicted Rejected', 'Predicted Approved'], 
            yticklabels=['Actual Rejected', 'Actual Approved'])
plt.title('Confusion Matrix - Loan Approval')
plt.ylabel('Actual Label')
plt.xlabel('Predicted Label')
plt.savefig('confusion_matrix.png') # Saves the plot as a file
print("Saved confusion_matrix.png")


# **FIX 4: Use a better plot for a continuous 'credit_score'**
# VISUALIZATION 2: Insight on Key Factor
# Let's analyze the most important feature: Credit Score
# (Save this plot for your PDF)
plt.figure(figsize=(10, 6))
# Use a Kernel Density Plot to show distributions
sns.kdeplot(data=df, x='credit_score', hue='loan_approved', 
            fill=True, common_norm=False, palette='viridis',
            hue_order=[0, 1])
plt.title('Distribution of Credit Score by Loan Approval Status')
plt.xlabel('Credit Score')
plt.ylabel('Density')
# Manually create legend labels
handles, _ = plt.gca().get_legend_handles_labels()
plt.legend(title='Loan Status', labels=['Rejected (0)', 'Approved (1)'], handles=handles)
plt.savefig('credit_score_analysis.png') # Saves the plot as a file
print("Saved credit_score_analysis.png")

print("\nTo see the plots, open 'confusion_matrix.png' and 'credit_score_analysis.png'")
import sqlite3
import json

conn = sqlite3.connect("nafdac_drugs.db")
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS drugs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT,
        active_ingredient TEXT,
        category TEXT,
        nafdac_reg_no TEXT UNIQUE,
        form TEXT,
        applicant TEXT,
        approval_date TEXT,
        status TEXT
    )
""")

def extract_string(value):
    if isinstance(value, dict):
        return value.get("name") or value.get("ingredient_name") or value.get("applicant_name")
    return value

with open("nafdac_raw.json") as f:
    drugs = json.load(f)

for drug in drugs:
    cursor.execute("""
        INSERT OR IGNORE INTO drugs 
        (product_name, active_ingredient, category, nafdac_reg_no, form, applicant, approval_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        drug.get("product_name"),
        drug.get("ingredient_name") or drug.get("composition") or drug.get("active_ingredient"),
        drug.get("category_name") or extract_string(drug.get("product_category")) or drug.get("category"),
        drug.get("NAFDAC") or drug.get("nafdac_reg_no") or drug.get("nrn"),
        extract_string(drug.get("form")) or drug.get("form_name"),
        extract_string(drug.get("applicant")) or drug.get("applicant_name"),
        drug.get("approval_date"), drug.get("status")
    ))

conn.commit()
conn.close()
print("Database created successfully!")
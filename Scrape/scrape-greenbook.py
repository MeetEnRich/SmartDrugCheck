import requests
import json
import time
import sqlite3

#API endpoint
API_URL = "https://greenbook.nafdac.gov.ng/"

HEADERS = {
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://greenbook.nafdac.gov.ng/",
    "User-Agent": "Mozilla/5.0"
}

def build_params(start, length=100):
    params = {
        "draw": 1,
        "start": start,
        "length": length,
        "order[0][column]": 0,
        "order[0][dir]": "asc",
        "search[value]": "",
        "search[regex]": "false",
        "search_ingredient": "",
    }

    columns = [
        ("product_name",               "product_name",               "true",  "true"),
        ("ingredient.ingredient_name", "ingredient.ingredient_name", "true",  "true"),
        ("product_category.name",      "product_category.name",      "true",  "false"),
        ("product_category_id",        "product_category_id",        "true",  "true"),
        ("ingredient.synonym",         "ingredient.synonym",         "true",  "true"),
        ("NAFDAC",                     "NAFDAC",                     "true",  "true"),
        ("form.name",                  "form.name",                  "true",  "true"),
        ("route.name",                 "route.name",                 "true",  "true"),
        ("strength",                   "strength",                   "true",  "true"),
        ("applicant.name",             "applicant.name",             "true",  "true"),
        ("approval_date",              "approval_date",              "true",  "true"),
        ("status",                     "status",                     "true",  "true"),
    ]

    for i, (data, name, searchable, orderable) in enumerate(columns):
        params[f"columns[{i}][data]"]          = data
        params[f"columns[{i}][name]"]          = name
        params[f"columns[{i}][searchable]"]    = searchable
        params[f"columns[{i}][orderable]"]     = orderable
        params[f"columns[{i}][search][value]"] = ""
        params[f"columns[{i}][search][regex]"] = "false"

    return params

def fetch_page(start, length=100):
    params = build_params(start, length)
    response = requests.get(API_URL, params=params, headers=HEADERS)
    response.raise_for_status()
    return response.json()

def scrape_all():
    all_products = []

    print("Fetching first page...")
    first = fetch_page(0, 100)
    total = first["recordsTotal"]
    all_products.extend(first["data"])
    print(f"Total records: {total} | Fetched: {len(all_products)}")

    start = 100
    while start < total:
        data = fetch_page(start, 100)
        all_products.extend(data["data"])
        start += 100
        print(f"Progress: {min(start, total)} / {total}")
        time.sleep(0.5)

    return all_products

def setup_database():
    conn = sqlite3.connect("nafdac_drugs.db")
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            product_id    INTEGER PRIMARY KEY,
            product_name  TEXT,
            nafdac_reg_no TEXT UNIQUE,
            ingredient    TEXT,
            synonym       TEXT,
            category      TEXT,
            form          TEXT,
            route         TEXT,
            strength      TEXT,
            applicant     TEXT,
            approval_date TEXT,
            expiry_date   TEXT,
            status        TEXT,
            pack_size     TEXT,
            composition   TEXT,
            atc           TEXT
        )
    """)
    conn.commit()
    conn.close()
    print("✅ SQLite database and table ready.")

def safe_date(val):
    """Reject malformed dates like '-000001-11-30'"""
    if not val or str(val).startswith("-") or val == "0000-00-00":
        return None
    return str(val)[:10]  # trim to YYYY-MM-DD

def save_to_sqlite(products):
    conn = sqlite3.connect("nafdac_drugs.db")
    cur = conn.cursor()

    sql = """
        INSERT OR REPLACE INTO products (
            product_id, product_name, nafdac_reg_no, ingredient, synonym,
            category, form, route, strength, applicant,
            approval_date, expiry_date, status, pack_size, composition, atc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    rows = []
    for p in products:
        rows.append((
            p.get("product_id"),
            p.get("product_name"),
            p.get("NAFDAC"),
            p.get("ingredient_name"),
            p.get("synonym"),
            p.get("category_name"),
            p.get("form_name"),
            p.get("route_name"),
            p.get("strength"),
            p.get("applicant_name"),
            safe_date(p.get("approval_date")),
            safe_date(p.get("expiry_date")),
            p.get("status"),
            p.get("pack_size"),
            p.get("composition"),
            p.get("atc"),
        ))

    cur.executemany(sql, rows)
    conn.commit()
    print(f"✅ {len(rows)} records saved to nafdac_drugs.db")
    conn.close()

if __name__ == "__main__":
    setup_database()
    products = scrape_all()

    # Always keep a raw JSON backup
    with open("nafdac_raw.json", "w") as f:
        json.dump(products, f, indent=2)
    print("✅ JSON backup saved to nafdac_raw.json")

    save_to_sqlite(products)
    
    # CRITICAL FIX: Automatically run create-db.py to build the Django-compatible drugs table
    import subprocess, sys
    print("Building Django-compatible drugs table...")
    try:
        subprocess.run([sys.executable, "create-db.py"], check=True)
        print("Done. Copy nafdac_drugs.db to the project root as db.sqlite3.")
    except Exception as e:
        print(f"Error building drugs table: {e}")
        
    print("🎉 Done! Open DB Browser for SQLite to view your data.")
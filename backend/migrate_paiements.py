"""
Migration script to add payment link fields to paiements table
"""
import sqlite3
from datetime import datetime

# Connect to database
conn = sqlite3.connect('maraakiz.db')
cursor = conn.cursor()

print("🔄 Adding payment link fields to paiements table...")

# Add new columns
try:
    # Add lien_paiement
    cursor.execute("""
        ALTER TABLE paiements ADD COLUMN lien_paiement VARCHAR(500)
    """)
    print("✅ Added lien_paiement column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⏭️  lien_paiement column already exists")
    else:
        raise

try:
    # Add lien_expiration
    cursor.execute("""
        ALTER TABLE paiements ADD COLUMN lien_expiration DATETIME
    """)
    print("✅ Added lien_expiration column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⏭️  lien_expiration column already exists")
    else:
        raise

try:
    # Add email_envoye
    cursor.execute("""
        ALTER TABLE paiements ADD COLUMN email_envoye BOOLEAN DEFAULT 0
    """)
    print("✅ Added email_envoye column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⏭️  email_envoye column already exists")
    else:
        raise

try:
    # Add date_email
    cursor.execute("""
        ALTER TABLE paiements ADD COLUMN date_email DATETIME
    """)
    print("✅ Added date_email column")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⏭️  date_email column already exists")
    else:
        raise

# Commit changes
conn.commit()

# Verify the schema
print("\n📋 Current paiements table schema:")
cursor.execute("PRAGMA table_info(paiements)")
columns = cursor.fetchall()
for col in columns:
    print(f"  {col[1]} ({col[2]})")

conn.close()

print("\n✅ Migration completed successfully!")

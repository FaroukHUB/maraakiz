"""
Script to initialize the database with all tables
"""
from app.database import Base, engine
from app.models import (
    user,
    eleve,
    merkez,
    cours,
    message,
    paiement,
    notes_cours
)

print("Creating all database tables...")
Base.metadata.create_all(bind=engine)
print("✅ Database tables created successfully!")

# List tables
import sqlite3
conn = sqlite3.connect('maraakiz.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = cursor.fetchall()
print("\nTables created:")
for table in tables:
    print(f"  • {table[0]}")
conn.close()

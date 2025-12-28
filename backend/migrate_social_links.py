"""
Migration script to add social media links to merkez table
"""
import sqlite3

# Connect to database
conn = sqlite3.connect('maraakiz.db')
cursor = conn.cursor()

print("🔄 Adding social media fields to merkez table...")

# Add new columns
social_fields = [
    ('site_web', 'VARCHAR(500)'),
    ('facebook', 'VARCHAR(500)'),
    ('instagram', 'VARCHAR(500)'),
    ('linkedin', 'VARCHAR(500)'),
    ('twitter', 'VARCHAR(500)'),
    ('youtube', 'VARCHAR(500)')
]

for field_name, field_type in social_fields:
    try:
        cursor.execute(f"ALTER TABLE merkez ADD COLUMN {field_name} {field_type}")
        print(f"✅ Added {field_name} column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"⏭️  {field_name} column already exists")
        else:
            raise

# Commit changes
conn.commit()

# Verify the schema
print("\n📋 Current merkez table schema:")
cursor.execute("PRAGMA table_info(merkez)")
columns = cursor.fetchall()
for col in columns:
    print(f"  {col[1]} ({col[2]})")

conn.close()

print("\n✅ Migration completed successfully!")
print("🎉 Social media links are now available!")

"""
Migration script to add avatar fields to eleves and users tables
"""
import sqlite3
from datetime import datetime

# Connect to database
conn = sqlite3.connect('maraakiz.db')
cursor = conn.cursor()

print("🔄 Adding avatar fields to eleves and users tables...")

# ==== ELEVES TABLE ====
print("\n📝 Updating eleves table...")

try:
    # Add avatar_url to eleves
    cursor.execute("""
        ALTER TABLE eleves ADD COLUMN avatar_url VARCHAR(255)
    """)
    print("✅ Added avatar_url column to eleves")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⏭️  avatar_url column already exists in eleves")
    else:
        raise

# Update existing students with avatars based on their genre
print("\n🎨 Assigning avatars based on genre...")
cursor.execute("""
    UPDATE eleves
    SET avatar_url = CASE
        WHEN LOWER(genre) = 'homme' THEN '/avatars/homme.webp'
        WHEN LOWER(genre) = 'femme' THEN '/avatars/femme.webp'
        WHEN LOWER(genre) = 'garcon' THEN '/avatars/garcon.webp'
        WHEN LOWER(genre) = 'fille' THEN '/avatars/fille.webp'
        ELSE NULL
    END
    WHERE genre IS NOT NULL AND avatar_url IS NULL
""")
updated_students = cursor.rowcount
print(f"✅ Updated {updated_students} students with avatars")

# ==== USERS TABLE ====
print("\n📝 Updating users table...")

try:
    # Add genre to users
    cursor.execute("""
        ALTER TABLE users ADD COLUMN genre VARCHAR(20)
    """)
    print("✅ Added genre column to users")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⏭️  genre column already exists in users")
    else:
        raise

try:
    # Add avatar_url to users
    cursor.execute("""
        ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255)
    """)
    print("✅ Added avatar_url column to users")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⏭️  avatar_url column already exists in users")
    else:
        raise

try:
    # Add avatar_type to users
    cursor.execute("""
        ALTER TABLE users ADD COLUMN avatar_type VARCHAR(20) DEFAULT 'default'
    """)
    print("✅ Added avatar_type column to users")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⏭️  avatar_type column already exists in users")
    else:
        raise

# Commit changes
conn.commit()

# Verify the schemas
print("\n📋 Current eleves table schema:")
cursor.execute("PRAGMA table_info(eleves)")
columns = cursor.fetchall()
for col in columns:
    print(f"  {col[1]} ({col[2]})")

print("\n📋 Current users table schema:")
cursor.execute("PRAGMA table_info(users)")
columns = cursor.fetchall()
for col in columns:
    print(f"  {col[1]} ({col[2]})")

conn.close()

print("\n✅ Migration completed successfully!")
print("🎉 Avatar system is now ready!")

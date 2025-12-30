"""
Migration script to add institut_id field to users table
This field differentiates between:
- Independent professors (institut_id = NULL) - appear on public site
- Salaried professors (institut_id = ID) - managed by an institut, not public
"""
import sqlite3

# Connect to database
conn = sqlite3.connect('maraakiz.db')
cursor = conn.cursor()

print("🔄 Adding institut_id field to users table...")

try:
    # Add institut_id to users
    cursor.execute("""
        ALTER TABLE users ADD COLUMN institut_id INTEGER
    """)
    print("✅ Added institut_id column to users")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⏭️  institut_id column already exists in users")
    else:
        raise

# Commit changes
conn.commit()

# Verify the schema
print("\n📋 Current users table schema:")
cursor.execute("PRAGMA table_info(users)")
columns = cursor.fetchall()
for col in columns:
    print(f"  {col[1]} ({col[2]})")

# Check current professors
print("\n📊 Current professors status:")
cursor.execute("""
    SELECT id, email, full_name, user_type, institut_id
    FROM users
    WHERE user_type = 'professeur'
""")
professors = cursor.fetchall()
print(f"  Total professors: {len(professors)}")
independent = sum(1 for p in professors if p[4] is None)
salaried = sum(1 for p in professors if p[4] is not None)
print(f"  Independent (institut_id = NULL): {independent}")
print(f"  Salaried (institut_id != NULL): {salaried}")

conn.close()

print("\n✅ Migration completed successfully!")
print("🎉 Institut ID field is now ready!")
print("\nℹ️  Note: All existing professors are currently set as independent (institut_id = NULL)")
print("   Instituts can now create salaried professor accounts through the dashboard.")

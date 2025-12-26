"""
Migration script to add file upload columns to messages table
"""
import sqlite3
import os

DB_PATH = "maraakiz.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(messages)")
        columns = [column[1] for column in cursor.fetchall()]

        columns_to_add = []
        if 'fichier_nom' not in columns:
            columns_to_add.append(('fichier_nom', 'VARCHAR(255)'))
        if 'fichier_type' not in columns:
            columns_to_add.append(('fichier_type', 'VARCHAR(100)'))
        if 'fichier_taille' not in columns:
            columns_to_add.append(('fichier_taille', 'INTEGER'))

        if not columns_to_add:
            print("✅ All columns already exist. No migration needed.")
            return

        print(f"📝 Adding {len(columns_to_add)} new columns to messages table...")

        for col_name, col_type in columns_to_add:
            cursor.execute(f"ALTER TABLE messages ADD COLUMN {col_name} {col_type}")
            print(f"   ✓ Added column: {col_name} ({col_type})")

        # Also check if 'contenu' column is nullable
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='messages'")
        table_schema = cursor.fetchone()[0]

        if 'contenu TEXT NOT NULL' in table_schema:
            print("\n⚠️  Warning: 'contenu' column is NOT NULL, but should be nullable for file-only messages")
            print("   This won't cause errors for existing data, but new file-only messages will work fine.")

        conn.commit()
        print("\n✅ Migration completed successfully!")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()

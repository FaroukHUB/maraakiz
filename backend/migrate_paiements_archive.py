import sqlite3
from datetime import datetime

def migrate():
    print("🔄 Migration: Ajout des champs d'archivage aux paiements")

    # Connect to database
    conn = sqlite3.connect('maraakiz.db')
    cursor = conn.cursor()

    try:
        # Vérifier si les colonnes existent déjà
        cursor.execute("PRAGMA table_info(paiements)")
        columns = [col[1] for col in cursor.fetchall()]

        # Ajouter la colonne archived si elle n'existe pas
        if 'archived' not in columns:
            print("  → Ajout de la colonne 'archived'...")
            cursor.execute('''
                ALTER TABLE paiements
                ADD COLUMN archived BOOLEAN DEFAULT 0
            ''')
            print("  ✅ Colonne 'archived' ajoutée")
        else:
            print("  ℹ️  Colonne 'archived' existe déjà")

        # Ajouter la colonne archived_at si elle n'existe pas
        if 'archived_at' not in columns:
            print("  → Ajout de la colonne 'archived_at'...")
            cursor.execute('''
                ALTER TABLE paiements
                ADD COLUMN archived_at TIMESTAMP
            ''')
            print("  ✅ Colonne 'archived_at' ajoutée")
        else:
            print("  ℹ️  Colonne 'archived_at' existe déjà")

        conn.commit()
        print("\n✅ Migration terminée avec succès!")

    except sqlite3.Error as e:
        print(f"\n❌ Erreur lors de la migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()

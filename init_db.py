import pymysql

def create_db():
    try:
        # Connect to MySQL (no DB specified)
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',
            port=3306
        )
        cursor = connection.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS capi_db")
        print("Database 'capi_db' checked/created successfully.")
        
        # Check if categories table exists, if not, create it and add some defaults
        # Actually, FastAPI (SQLAlchemy) will create tables on startup
        # But maybe we want to seed some categories if it's empty
        
        connection.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_db()

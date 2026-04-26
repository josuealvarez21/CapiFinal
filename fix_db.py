from sqlalchemy import text
from app.db.database import engine

with engine.connect() as con:
    columns_to_add = [
        "is_active TINYINT DEFAULT 1",
        "fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP"
    ]
    
    for col in columns_to_add:
        try:
            con.execute(text(f"ALTER TABLE usuarios ADD COLUMN {col}"))
            con.commit()
            print(f"Columna '{col.split()[0]}' agregada con éxito.")
        except Exception as e:
            # ignore if column already exists
            print(f"La columna '{col.split()[0]}' posiblemente ya existe.")

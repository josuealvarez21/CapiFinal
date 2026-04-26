from sqlalchemy import text
from app.db.database import engine

with engine.connect() as con:
    try:
        con.execute(text("ALTER TABLE usuarios ADD COLUMN foto_perfil VARCHAR(255) NULL"))
        con.commit()
        print("Columna 'foto_perfil' agregada con éxito.")
    except Exception as e:
        print("Aviso: Posiblemente la columna ya existe. Detalle:", str(e))

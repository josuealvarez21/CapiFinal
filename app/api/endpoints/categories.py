from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.crud import crud
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Categoria])
def get_categories(
    db: Session = Depends(deps.get_db)
):
    categories = crud.get_categories(db)
    if not categories:
        # Create some default categories for the Demo
        from app.models.models import Categoria
        default_cats = [
            Categoria(nombre_categoria="Salario", tipo="ingreso"),
            Categoria(nombre_categoria="Comida", tipo="gasto"),
            Categoria(nombre_categoria="Alquiler", tipo="gasto"),
            Categoria(nombre_categoria="Transporte", tipo="gasto"),
            Categoria(nombre_categoria="Entretenimiento", tipo="gasto"),
            Categoria(nombre_categoria="Servicios", tipo="gasto")
        ]
        db.add_all(default_cats)
        db.commit()
        categories = crud.get_categories(db)
        
    return categories

from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crud
from app.schemas import schemas
from app.models.models import Usuario

router = APIRouter()

@router.post("/", response_model=schemas.Movimiento)
def create_movement(
    *,
    db: Session = Depends(deps.get_db),
    movement_in: schemas.MovimientoCreate
) -> Any:
    return crud.create_movement(db, movement=movement_in, id_usuario=1)

@router.get("/", response_model=List[schemas.Movimiento])
def read_movements(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    return crud.get_user_movements(db, id_usuario=1, skip=skip, limit=limit)

@router.get("/balance", response_model=schemas.Balance)
def read_balance(
    db: Session = Depends(deps.get_db)
) -> Any:
    return crud.get_user_balance(db, id_usuario=1)

@router.delete("/{id_movimiento}")
def delete_movement(
    *,
    db: Session = Depends(deps.get_db),
    id_movimiento: int
) -> Any:
    success = crud.delete_movement(db, id_movimiento=id_movimiento, id_usuario=1)
    if not success:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado")
    return {"message": "Movimiento eliminado"}

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
    movement_in: schemas.MovimientoCreate,
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    return crud.create_movement(db, movement=movement_in, id_usuario=current_user.id_usuario)

@router.get("/", response_model=List[schemas.Movimiento])
def read_movements(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    return crud.get_user_movements(db, id_usuario=current_user.id_usuario, skip=skip, limit=limit)

@router.get("/balance", response_model=schemas.Balance)
def read_balance(
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    return crud.get_user_balance(db, id_usuario=current_user.id_usuario)

@router.delete("/{id_movimiento}")
def delete_movement(
    *,
    db: Session = Depends(deps.get_db),
    id_movimiento: int,
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    success = crud.delete_movement(db, id_movimiento=id_movimiento, id_usuario=current_user.id_usuario)
    if not success:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado")
    return {"message": "Movimiento eliminado"}

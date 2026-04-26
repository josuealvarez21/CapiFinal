from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crud
from app.schemas import schemas
from app.models.models import Usuario

router = APIRouter()

@router.post("/", response_model=schemas.Meta)
def create_goal(
    *,
    db: Session = Depends(deps.get_db),
    goal_in: schemas.MetaCreate,
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    return crud.create_goal(db, goal=goal_in, id_usuario=current_user.id_usuario)

@router.get("/", response_model=List[schemas.Meta])
def read_goals(
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    return crud.get_user_goals(db, id_usuario=current_user.id_usuario)

@router.post("/bulk-allocate/", response_model=List[schemas.Meta])
def allocate_goals(
    *,
    db: Session = Depends(deps.get_db),
    allocations: List[schemas.MetaAllocation],
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    return crud.allocate_to_goals_batch(db, allocations=allocations, id_usuario=current_user.id_usuario)

@router.delete("/{id_meta}")
def delete_goal(
    *,
    db: Session = Depends(deps.get_db),
    id_meta: int,
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    success = crud.delete_goal(db, id_meta=id_meta, id_usuario=current_user.id_usuario)
    if not success:
        raise HTTPException(status_code=404, detail="Meta no encontrada")
    return {"message": "Meta eliminada"}

@router.put("/{id_meta}", response_model=schemas.Meta)
def update_goal(
    *,
    db: Session = Depends(deps.get_db),
    id_meta: int,
    goal_update: schemas.MetaUpdateAmount,
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    goal = crud.update_goal_amount(db, id_meta=id_meta, id_usuario=current_user.id_usuario, additional_amount=goal_update.monto_adicional)
    if not goal:
        raise HTTPException(status_code=404, detail="Meta no encontrada")
    return goal

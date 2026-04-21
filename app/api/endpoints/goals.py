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
    goal_in: schemas.MetaCreate
) -> Any:
    return crud.create_goal(db, goal=goal_in, id_usuario=1)

@router.get("/", response_model=List[schemas.Meta])
def read_goals(
    db: Session = Depends(deps.get_db)
) -> Any:
    return crud.get_user_goals(db, id_usuario=1)

@router.post("/bulk-allocate/", response_model=List[schemas.Meta])
def allocate_goals(
    *,
    db: Session = Depends(deps.get_db),
    allocations: List[schemas.MetaAllocation]
) -> Any:
    return crud.allocate_to_goals_batch(db, allocations=allocations, id_usuario=1)

@router.delete("/{id_meta}")
def delete_goal(
    *,
    db: Session = Depends(deps.get_db),
    id_meta: int
) -> Any:
    success = crud.delete_goal(db, id_meta=id_meta, id_usuario=1)
    if not success:
        raise HTTPException(status_code=404, detail="Meta no encontrada")
    return {"message": "Meta eliminada"}

@router.put("/{id_meta}", response_model=schemas.Meta)
def update_goal(
    *,
    db: Session = Depends(deps.get_db),
    id_meta: int,
    goal_update: schemas.MetaUpdateAmount
) -> Any:
    goal = crud.update_goal_amount(db, id_meta=id_meta, id_usuario=1, additional_amount=goal_update.monto_adicional)
    if not goal:
        raise HTTPException(status_code=404, detail="Meta no encontrada")
    return goal

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

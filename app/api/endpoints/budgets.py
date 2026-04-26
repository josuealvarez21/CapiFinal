from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crud
from app.schemas import schemas
from app.models.models import Usuario

router = APIRouter()

@router.post("/", response_model=schemas.Presupuesto)
def create_budget(
    *,
    db: Session = Depends(deps.get_db),
    budget_in: schemas.PresupuestoCreate,
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    return crud.create_budget(db, budget=budget_in, id_usuario=current_user.id_usuario)

@router.get("/", response_model=List[schemas.Presupuesto])
def read_budgets(
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    return crud.get_user_budgets(db, id_usuario=current_user.id_usuario)

@router.delete("/{id_presupuesto}")
def delete_budget(
    *,
    db: Session = Depends(deps.get_db),
    id_presupuesto: int,
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    success = crud.delete_budget(db, id_presupuesto=id_presupuesto, id_usuario=current_user.id_usuario)
    if not success:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    return {"message": "Presupuesto eliminado"}

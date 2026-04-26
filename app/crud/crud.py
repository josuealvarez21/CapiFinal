from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Usuario, Movimiento, MetaAhorro, Categoria, Presupuesto, HistorialIA
from app.schemas import schemas
from app.schemas.schemas import UsuarioCreate, MovimientoCreate, MetaCreate, PresupuestoCreate, MetaAllocation
from app.core.security import get_password_hash
from decimal import Decimal
from typing import List

# --- Usuario CRUD ---
def get_user_by_email(db: Session, email: str):
    return db.query(Usuario).filter(Usuario.email == email).first()

def get_user_by_id(db: Session, id_usuario: int):
    return db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()

def create_user(db: Session, user: UsuarioCreate):
    hashed_password = get_password_hash(user.password)
    db_user = Usuario(
        nombre=user.nombre,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Categoria CRUD ---
def get_categories(db: Session):
    return db.query(Categoria).all()

# --- Movimiento CRUD ---
def create_movement(db: Session, movement: MovimientoCreate, id_usuario: int):
    db_movement = Movimiento(
        **movement.dict(),
        id_usuario=id_usuario
    )
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement

def get_user_movements(db: Session, id_usuario: int, skip: int = 0, limit: int = 100):
    return db.query(Movimiento).filter(Movimiento.id_usuario == id_usuario).order_by(Movimiento.fecha.desc()).offset(skip).limit(limit).all()

def delete_movement(db: Session, id_movimiento: int, id_usuario: int):
    db_movement = db.query(Movimiento).filter(Movimiento.id_movimiento == id_movimiento, Movimiento.id_usuario == id_usuario).first()
    if db_movement:
        db.delete(db_movement)
        db.commit()
        return True
    return False

def get_user_balance(db: Session, id_usuario: int):
    movements = db.query(Movimiento).filter(Movimiento.id_usuario == id_usuario).all()
    total_ingresos = sum((m.monto for m in movements if m.categoria.tipo == 'ingreso'), Decimal('0.00'))
    total_gastos = sum((m.monto for m in movements if m.categoria.tipo == 'gasto'), Decimal('0.00'))
    return {
        "total_ingresos": total_ingresos,
        "total_gastos": total_gastos,
        "balance_actual": total_ingresos - total_gastos
    }

# --- MetaAhorro CRUD ---
def create_goal(db: Session, goal: MetaCreate, id_usuario: int):
    db_goal = MetaAhorro(
        **goal.dict(),
        id_usuario=id_usuario
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def get_user_goals(db: Session, id_usuario: int):
    return db.query(MetaAhorro).filter(MetaAhorro.id_usuario == id_usuario).all()

def delete_goal(db: Session, id_meta: int, id_usuario: int):
    db_goal = db.query(MetaAhorro).filter(MetaAhorro.id_meta == id_meta, MetaAhorro.id_usuario == id_usuario).first()
    if db_goal:
        db.delete(db_goal)
        db.commit()
        return True
    return False

def update_goal_amount(db: Session, id_meta: int, id_usuario: int, additional_amount: Decimal):
    db_goal = db.query(MetaAhorro).filter(MetaAhorro.id_meta == id_meta, MetaAhorro.id_usuario == id_usuario).first()
    if db_goal:
        db_goal.monto_actual += additional_amount
        db.commit()
        db.refresh(db_goal)
        return db_goal
    return None

def allocate_to_goals_batch(db: Session, allocations: List[schemas.MetaAllocation], id_usuario: int):
    # Intentamos buscar una categoría para "Ahorro/Inversión" o usamos una por defecto
    cat_ahorro = db.query(Categoria).filter(Categoria.nombre_categoria == "Ahorro").first()
    if not cat_ahorro:
        cat_ahorro = Categoria(nombre_categoria="Ahorro", tipo="gasto")
        db.add(cat_ahorro)
        db.commit()
        db.refresh(cat_ahorro)
    
    results = []
    total_amount = Decimal("0.00")
    
    for alloc in allocations:
        db_goal = db.query(MetaAhorro).filter(MetaAhorro.id_meta == alloc.id_meta, MetaAhorro.id_usuario == id_usuario).first()
        if db_goal:
            db_goal.monto_actual += alloc.monto
            total_amount += alloc.monto
            results.append(db_goal)
            
    if total_amount > 0:
        # Registrar el gasto de ahorro
        db_movement = Movimiento(
            monto=total_amount,
            descripcion=f"Ahorro alocado en {len(allocations)} metas",
            id_categoria=cat_ahorro.id_categoria,
            id_usuario=id_usuario,
            fecha=func.now()
        )
        db.add(db_movement)
        
    db.commit()
    for r in results:
        db.refresh(r)
    return results

# --- Presupuesto CRUD ---
def create_budget(db: Session, budget: PresupuestoCreate, id_usuario: int):
    db_budget = Presupuesto(
        **budget.dict(),
        id_usuario=id_usuario
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def get_user_budgets(db: Session, id_usuario: int):
    return db.query(Presupuesto).filter(Presupuesto.id_usuario == id_usuario).all()

def delete_budget(db: Session, id_presupuesto: int, id_usuario: int):
    db_budget = db.query(Presupuesto).filter(Presupuesto.id_presupuesto == id_presupuesto, Presupuesto.id_usuario == id_usuario).first()
    if db_budget:
        db.delete(db_budget)
        db.commit()
        return True
    return False

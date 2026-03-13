from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Usuario, Movimiento, MetaAhorro, Categoria, Presupuesto, HistorialIA
from app.schemas.schemas import UsuarioCreate, MovimientoCreate, MetaCreate, PresupuestoCreate
from app.core.security import get_password_hash
from decimal import Decimal

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
        password=hashed_password
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
    return db.query(Movimiento).filter(Movimiento.id_usuario == id_usuario).offset(skip).limit(limit).all()

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

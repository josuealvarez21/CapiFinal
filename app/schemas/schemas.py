from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from decimal import Decimal
from datetime import datetime, date

# --- Usuario Schemas ---
class UsuarioBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    email: EmailStr
    foto_perfil: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(UsuarioBase):
    password: Optional[str] = None
    nombre: Optional[str] = None

class Usuario(UsuarioBase):
    id_usuario: int
    fecha_registro: datetime
    is_active: bool = True

    class Config:
        from_attributes = True

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None

# --- Categoria Schemas ---
class CategoriaBase(BaseModel):
    nombre_categoria: str = Field(..., max_length=100)
    tipo: str # 'ingreso' or 'gasto'

    @validator('tipo')
    def validate_tipo(cls, v):
        if v not in ['ingreso', 'gasto']:
            raise ValueError("Tipo debe ser 'ingreso' o 'gasto'")
        return v

class Categoria(CategoriaBase):
    id_categoria: int

    class Config:
        from_attributes = True

# --- Movimiento Schemas ---
class MovimientoBase(BaseModel):
    id_categoria: int
    monto: Decimal = Field(..., gt=0)
    descripcion: Optional[str] = None
    fecha: date

class MovimientoCreate(MovimientoBase):
    pass

class Movimiento(MovimientoBase):
    id_movimiento: int
    id_usuario: int

    class Config:
        from_attributes = True

# --- MetaAhorro Schemas ---
class MetaBase(BaseModel):
    nombre_meta: str = Field(..., max_length=100)
    monto_objetivo: Decimal = Field(..., gt=0)
    monto_actual: Decimal = Field(default=Decimal("0.00"), ge=0)
    fecha_limite: date

class MetaCreate(MetaBase):
    pass

class MetaUpdateAmount(BaseModel):
    monto_adicional: Decimal

class MetaAllocation(BaseModel):
    id_meta: int
    monto: Decimal

class Meta(MetaBase):
    id_meta: int
    id_usuario: int
    progreso: Optional[float] = None

    class Config:
        from_attributes = True

    @validator('progreso', always=True)
    def calculate_progreso(cls, v, values):
        if 'monto_actual' in values and 'monto_objetivo' in values:
            objetivo = values['monto_objetivo']
            actual = values['monto_actual']
            if objetivo > 0:
                return float((actual / objetivo) * 100)
        return 0.0

# --- Presupuesto Schemas ---
class PresupuestoBase(BaseModel):
    id_categoria: int
    monto_limite: Decimal = Field(..., gt=0)
    mes: int = Field(..., ge=1, le=12)
    anio: int = Field(..., ge=2024)

class PresupuestoCreate(PresupuestoBase):
    pass

class Presupuesto(PresupuestoBase):
    id_presupuesto: int
    id_usuario: int

    class Config:
        from_attributes = True

# --- HistorialIA Schemas ---
class HistorialIABase(BaseModel):
    rol: str # 'usuario' or 'ia'
    contenido: str

class HistorialIA(HistorialIABase):
    id_mensaje: int
    id_usuario: int
    fecha_hora: datetime

    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None

# --- Balance Schema ---
class Balance(BaseModel):
    total_ingresos: Decimal
    total_gastos: Decimal
    balance_actual: Decimal

# --- Dashboard Schemas ---
class DashboardSummary(BaseModel):
    balance_total: Decimal
    ingresos_mes: Decimal
    gastos_mes: Decimal

class CategoriaDistribucion(BaseModel):
    nombre: str
    valor: Decimal
    color: str

class MovimientoDashboard(BaseModel):
    id: str
    descripcion: str
    monto: Decimal
    tipo: str
    categoria: str
    fecha: str

class MetaDashboard(BaseModel):
    id: str
    nombre: str
    monto_objetivo: Decimal
    ahorro_actual: Decimal
    fecha_limite: Optional[date] = None
    color: str

class PresupuestoDashboard(BaseModel):
    id: str
    categoria: str
    gastado: Decimal
    limite: Decimal

class DashboardUserData(BaseModel):
    nombre: str
    foto_perfil: Optional[str] = None

class DashboardData(BaseModel):
    user: DashboardUserData
    summary: DashboardSummary
    distribucion_gastos: List[CategoriaDistribucion]
    ultimos_movimientos: List[MovimientoDashboard]
    metas: List[MetaDashboard]
    presupuestos: List[PresupuestoDashboard]


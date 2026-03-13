from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Numeric, DateTime, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    fecha_registro = Column(DateTime, server_default=func.now())

    # Relationships
    movimientos = relationship("Movimiento", back_populates="usuario", cascade="all, delete-orphan")
    metas = relationship("MetaAhorro", back_populates="usuario", cascade="all, delete-orphan")
    presupuestos = relationship("Presupuesto", back_populates="usuario", cascade="all, delete-orphan")
    historial_ia = relationship("HistorialIA", back_populates="usuario", cascade="all, delete-orphan")

class Categoria(Base):
    __tablename__ = "categorias"
    id_categoria = Column(Integer, primary_key=True, autoincrement=True)
    nombre_categoria = Column(String(100), nullable=False)
    tipo = Column(Enum('ingreso', 'gasto'), nullable=False)
    
    movimientos = relationship("Movimiento", back_populates="categoria")
    presupuestos = relationship("Presupuesto", back_populates="categoria")

class Movimiento(Base):
    __tablename__ = "movimientos"
    id_movimiento = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_categoria = Column(Integer, ForeignKey("categorias.id_categoria"), nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)
    descripcion = Column(Text)
    fecha = Column(Date, nullable=False)

    usuario = relationship("Usuario", back_populates="movimientos")
    categoria = relationship("Categoria", back_populates="movimientos")

class MetaAhorro(Base):
    __tablename__ = "metas_ahorro"
    id_meta = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    nombre_meta = Column(String(100), nullable=False)
    monto_objetivo = Column(Numeric(10, 2), nullable=False)
    monto_actual = Column(Numeric(10, 2), default=0.00)
    fecha_limite = Column(Date, nullable=False)

    usuario = relationship("Usuario", back_populates="metas")

class Presupuesto(Base):
    __tablename__ = "presupuestos"
    id_presupuesto = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_categoria = Column(Integer, ForeignKey("categorias.id_categoria"), nullable=False)
    monto_limite = Column(Numeric(10, 2), nullable=False)
    mes = Column(Integer, nullable=False)
    anio = Column(Integer, nullable=False)

    usuario = relationship("Usuario", back_populates="presupuestos")
    categoria = relationship("Categoria", back_populates="presupuestos")

class HistorialIA(Base):
    __tablename__ = "historial_ia"
    id_mensaje = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    rol = Column(Enum('usuario', 'ia'), nullable=False)
    contenido = Column(Text, nullable=False)
    fecha_hora = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario", back_populates="historial_ia")

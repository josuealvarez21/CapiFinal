from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime

from app.api import deps
from app.crud import crud
from app.schemas import schemas
from app.models.models import Usuario

router = APIRouter()

@router.get("/", response_model=schemas.DashboardData)
def get_dashboard_data(
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_user)
):
    user = current_user
    user_id = user.id_usuario


    # Gather data
    movements = crud.get_user_movements(db, id_usuario=user_id, limit=20)
    goals = crud.get_user_goals(db, id_usuario=user_id)
    budgets = crud.get_user_budgets(db, id_usuario=user_id)
    balance_dict = crud.get_user_balance(db, id_usuario=user_id)

    # 1. Summary
    # Asumimos ingresos_mes y gastos_mes igual a los historiales para demo rápida.
    # En un caso real se filtra por month() actual.
    gastos_mes = sum((m.monto for m in movements if m.categoria.tipo == 'gasto'), Decimal('0.00'))
    ingresos_mes = sum((m.monto for m in movements if m.categoria.tipo == 'ingreso'), Decimal('0.00'))

    summary = schemas.DashboardSummary(
        balance_total=balance_dict["balance_actual"],
        ingresos_mes=ingresos_mes,
        gastos_mes=gastos_mes
    )

    # 2. Distribucion Gastos
    # Agrupar por categoría
    category_totals = {}
    colors = ['#3b82f6', '#1C542D', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6']
    color_index = 0
    for mov in movements:
        if mov.categoria.tipo == 'gasto':
            cat_name = mov.categoria.nombre_categoria
            if cat_name not in category_totals:
                category_totals[cat_name] = Decimal('0.00')
            category_totals[cat_name] += mov.monto
            
    distribucion_gastos = []
    for cat_name, total in category_totals.items():
        distribucion_gastos.append(
            schemas.CategoriaDistribucion(
                nombre=cat_name,
                valor=total,
                color=colors[color_index % len(colors)]
            )
        )
        color_index += 1

    # Si no hay gastos, mandamos uno vacío o mock
    if not distribucion_gastos:
        distribucion_gastos.append(
            schemas.CategoriaDistribucion(nombre="Sin Gastos", valor=Decimal('1.00'), color='#2e2e2e')
        )

    # 3. Ultimos Movimientos
    ultimos_movimientos = []
    # Reverse to get newest first assuming they are ordered by ID ascending
    for mov in reversed(movements[-5:]):
        ultimos_movimientos.append(
            schemas.MovimientoDashboard(
                id=str(mov.id_movimiento),
                descripcion=mov.descripcion or "Movimiento",
                monto=mov.monto,
                tipo=mov.categoria.tipo,
                categoria=mov.categoria.nombre_categoria,
                fecha=mov.fecha.strftime("%d %b %Y")
            )
        )

    # 4. Metas
    metas_dashboard = []
    for meta in goals:
        metas_dashboard.append(
            schemas.MetaDashboard(
                id=str(meta.id_meta),
                nombre=meta.nombre_meta,
                monto_objetivo=meta.monto_objetivo,
                ahorro_actual=meta.monto_actual,
                fecha_limite=meta.fecha_limite,
                color='#f59e0b' # Naranja Cápi
            )
        )

    # 5. Presupuestos
    presupuestos_dashboard = []
    for pres in budgets:
        # Calcular gastado filtrando movimientos por mes y categoría
        # Para demo simple, sumamos todos los gastos de la categoría de este usuario
        gastado = sum((m.monto for m in movements if m.id_categoria == pres.id_categoria and m.fecha.month == pres.mes and m.fecha.year == pres.anio), Decimal('0.00'))
        
        presupuestos_dashboard.append(
            schemas.PresupuestoDashboard(
                id=str(pres.id_presupuesto),
                categoria=pres.categoria.nombre_categoria,
                gastado=gastado,
                limite=pres.monto_limite
            )
        )

    return schemas.DashboardData(
        user=schemas.DashboardUserData(nombre=user.nombre, foto_perfil=user.foto_perfil),
        summary=summary,
        distribucion_gastos=distribucion_gastos,
        ultimos_movimientos=ultimos_movimientos,
        metas=metas_dashboard,
        presupuestos=presupuestos_dashboard
    )

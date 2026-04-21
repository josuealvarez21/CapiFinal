from app.db.database import SessionLocal
from app.crud import crud
from app.api.endpoints import dashboard
from fastapi import Depends

def test_dashboard():
    db = SessionLocal()
    try:
        # Simulate what dashboard.get_dashboard_data does
        user_id = 1
        user = crud.get_user_by_id(db, user_id)
        print(f"User 1: {user}")
        
        movements = crud.get_user_movements(db, id_usuario=user_id)
        print(f"Movements count: {len(movements)}")
        
        for m in movements:
            if m.categoria is None:
                print(f"WARNING: Movement {m.id_movimiento} has NO category!")
        
        balance = crud.get_user_balance(db, id_usuario=user_id)
        print(f"Balance: {balance}")
        
        print("Test completed successfully.")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_dashboard()

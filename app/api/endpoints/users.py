from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
import os
import uuid
import shutil
from typing import Optional

from app.api import deps
from app.crud import crud
from app.schemas import schemas
from app.models.models import Usuario

router = APIRouter()

@router.post("/profile-picture")
async def update_profile(
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    nombre: Optional[str] = Form(None),
    db: Session = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_user)
):
    user = current_user

    if file:
        file_ext = os.path.splitext(file.filename)[1]
        if file_ext.lower() not in ['.png', '.jpg', '.jpeg', '.webp']:
             raise HTTPException(status_code=400, detail="Invalid file type")
        
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        filepath = os.path.join("static", "uploads", "profiles", unique_filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        foto_url = f"http://localhost:8000/static/uploads/profiles/{unique_filename}"
        user.foto_perfil = foto_url
        
    elif url:
        user.foto_perfil = url

    if nombre:
        user.nombre = nombre

    db.commit()
    db.refresh(user)

    return {"message": "Profile updated successfully", "foto_perfil": user.foto_perfil, "nombre": user.nombre}

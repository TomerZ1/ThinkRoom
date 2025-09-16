from typing import Annotated, List
from fastapi import APIRouter, Depends, UploadFile, File, status, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from db.database import get_db
from core.auth import get_current_user

from models.user import User
from models.material import Material
from schemas.material import MaterialResponse
from models.session_member import SessionMember

import os
import shutil

router = APIRouter(
    prefix="/materials",
    tags=["materials"]
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[User, Depends(get_current_user)]

@router.post("/upload", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
def upload_material(
    db: db_dependency,
    current_user: user_dependency,
    session_id: int,
    file: UploadFile = File(...)
):
    # verify session membership
    membership = (
        db.query(SessionMember)
        .filter(
            SessionMember.session_id == session_id,
            SessionMember.user_id == current_user.id
        )
        .first()
    )
    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized to upload to this session")

    # path inside container -> mapped to ./uploads on host
    upload_dir = "/app/uploads"
    os.makedirs(upload_dir, exist_ok=True)

    # build file path
    file_path = os.path.join(upload_dir, file.filename)

    # save file to disk
    with open(file_path, "wb") as buffer: # closed automatically 
        shutil.copyfileobj(file.file, buffer)
    
    # create DB entry
    new_material = Material(
        filename=file.filename,
        filepath=file_path,
        session_id=session_id,
        user_id=current_user.id
    )

    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material 

@router.get("/{session_id}", response_model=List[MaterialResponse])
def list_materials(
    db: db_dependency,
    current_user: user_dependency,
    session_id: int
):
    # verify session membership
    membership = (
        db.query(SessionMember)
        .filter(
            SessionMember.session_id == session_id,
            SessionMember.user_id == current_user.id
        )
        .first()
    )
    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized to view materials for this session")
    
    materials = (
        db.query(Material)
        .filter(Material.session_id == session_id)
        .all()
    )
    return materials

@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_material(
    db: db_dependency,
    current_user: user_dependency,
    material_id: int
):
    # find material 
    material = (
        db.query(Material)
        .filter(Material.id == material_id)
        .first()
    )
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # verify uploader
    if material.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the uploader can delete this material")
    
    # remove file from disk
    if os.path.exists(material.filepath):
        os.remove(material.filepath)

    # delete DB entry
    db.delete(material)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/{material_id}/download", response_class=FileResponse)
def download_material(
    db: db_dependency,
    current_user: user_dependency,
    material_id: int
):
    # find material
    material = (
        db.query(Material)
        .filter(Material.id == material_id)
        .first()
    )
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # verify session membership
    membership = (
        db.query(SessionMember)
        .filter(
            SessionMember.session_id == material.session_id,
            SessionMember.user_id == current_user.id
        )
        .first()
    )
    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized to download this material")
    
    # verify file exists on disk
    if not os.path.exists(material.filepath):
        raise HTTPException(status_code=410, detail="File not found on server")

    return FileResponse(
        path=material.filepath, 
        filename=material.filename,
        media_type='application/octet-stream'
    )



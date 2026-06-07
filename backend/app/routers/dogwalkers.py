from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models

router = APIRouter()

@router.get("/")
def get_dogwalkers(db: Session = Depends(get_db)):
    walkers = db.query(models.Dogwalker).all()
    return [
        {
            "d_walker_id": w.d_walker_id,
            "d_walker_login": w.d_walker_login,
            "d_walker_rating": w.d_walker_rating,
            "d_walker_status": w.d_walker_status
        }
        for w in walkers
    ]

@router.put("/{walker_id}")
async def update_dogwalker(walker_id: int, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    walker = db.query(models.Dogwalker).filter(models.Dogwalker.d_walker_id == walker_id).first()
    if not walker:
        raise HTTPException(404, "Выгульщик не найден")
    
    if 'd_walker_login' in data:
        walker.d_walker_login = data['d_walker_login']
    if 'd_walker_password' in data:
        walker.d_walker_password = data['d_walker_password']
    
    db.commit()
    return {"success": True}
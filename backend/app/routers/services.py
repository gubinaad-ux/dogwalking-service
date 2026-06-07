from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models

router = APIRouter()

@router.get("/")
def get_services(db: Session = Depends(get_db)):
    services = db.query(models.Service).all()
    return [
        {
            "service_id": s.service_id,
            "serv_name": s.serv_name,
            "serv_discrib": s.serv_discrib,
            "serv_base_cost": s.serv_base_cost
        }
        for s in services
    ]

@router.get("/with-walkers")
def get_services_with_walkers(db: Session = Depends(get_db)):
    results = db.query(
        models.Service.service_id,
        models.Service.serv_name,
        models.Service.serv_discrib,
        models.Service.serv_base_cost,
        models.Dogwalker.d_walker_id,
        models.Dogwalker.d_walker_login,
        models.Dogwalker.d_walker_rating
    ).join(
        models.Provide, models.Provide.service_id == models.Service.service_id
    ).join(
        models.Dogwalker, models.Dogwalker.d_walker_id == models.Provide.d_walker_id
    ).filter(
        models.Dogwalker.d_walker_status == 'A'
    ).all()
    
    return [
        {
            "service_id": r.service_id,
            "serv_name": r.serv_name,
            "serv_discrib": r.serv_discrib,
            "serv_base_cost": r.serv_base_cost,
            "d_walker_id": r.d_walker_id,
            "walker_login": r.d_walker_login,
            "walker_rating": r.d_walker_rating
        }
        for r in results
    ]
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models

router = APIRouter()

@router.get("/")
def get_clients(db: Session = Depends(get_db)):
    clients = db.query(models.Client).all()
    return [
        {
            "client_id": c.client_id,
            "client_fio": c.client_fio,
            "client_phone": c.client_phone,
            "client_email": c.client_email,
            "client_rating": c.client_rating
        }
        for c in clients
    ]

@router.put("/{client_id}")
async def update_client(client_id: int, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    client = db.query(models.Client).filter(models.Client.client_id == client_id).first()
    if not client:
        raise HTTPException(404, "Клиент не найден")
    
    client.client_fio = data.get('client_fio', client.client_fio)
    client.client_phone = data.get('client_phone', client.client_phone)
    client.client_email = data.get('client_email', client.client_email)
    db.commit()
    return {"success": True}

@router.get("/{client_id}/dogs")
def get_client_dogs(client_id: int, db: Session = Depends(get_db)):
    dogs = db.query(models.Dog).filter(models.Dog.client_id == client_id).all()
    return [
        {
            "dog_id": d.dog_id,
            "dog_name": d.dog_name,
            "dog_breed": d.dog_breed,
            "age": d.age,
            "weight": d.weight,
            "features": d.features
        }
        for d in dogs
    ]

@router.post("/{client_id}/dogs")
async def add_client_dog(client_id: int, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    dog = models.Dog(
        client_id=client_id,
        dog_name=data.get('dog_name'),
        dog_breed=data.get('dog_breed'),
        age=int(data.get('age')),
        weight=float(data.get('weight')),
        features=data.get('features', '')
    )
    db.add(dog)
    db.commit()
    db.refresh(dog)
    return {"success": True, "dog_id": dog.dog_id}

@router.delete("/{client_id}/dogs/{dog_id}")
def delete_client_dog(client_id: int, dog_id: int, db: Session = Depends(get_db)):
    dog = db.query(models.Dog).filter(
        models.Dog.dog_id == dog_id,
        models.Dog.client_id == client_id
    ).first()
    if not dog:
        raise HTTPException(404, "Собака не найдена")
    
    db.delete(dog)
    db.commit()
    return {"success": True}

@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.client_id == client_id).first()
    if client:
        db.delete(client)
        db.commit()
    return {"success": True}
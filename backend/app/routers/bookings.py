from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from pydantic import BaseModel

router = APIRouter()

class CreateBookingRequest(BaseModel):
    client_id: int
    dog_id: int
    service_id: int
    d_walker_id: int
    address: str
    datetime: str
    book_lasting: str
    full_cost: float

@router.post("/create")
def create_booking(data: CreateBookingRequest, db: Session = Depends(get_db)):
    booking = models.Booking(
        client_id=data.client_id,
        dog_id=data.dog_id,
        service_id=data.service_id,
        d_walker_id=data.d_walker_id,
        district_id=1,
        address=data.address,
        datetime=data.datetime,
        book_lasting=data.book_lasting,
        full_cost=data.full_cost,
        book_status='pending'
    )
    db.add(booking)
    db.commit()
    return {"success": True, "booking_id": booking.booking_id}

@router.get("/client/{client_id}")
def get_client_bookings(client_id: int, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(models.Booking.client_id == client_id).all()
    result = []
    for b in bookings:
        feedback_from_client = db.query(models.Feedback).filter(
            models.Feedback.booking_id == b.booking_id,
            models.Feedback.author_role == 'client'
        ).first()
        result.append({
            "booking_id": b.booking_id,
            "service_name": b.service.serv_name,
            "walker_login": b.d_walker.d_walker_login,
            "dog_name": b.dog.dog_name if b.dog else None,
            "d_walker_id": b.d_walker_id,
            "address": b.address,
            "datetime": str(b.datetime),
            "book_status": b.book_status,
            "full_cost": b.full_cost,
            "has_feedback": feedback_from_client is not None
        })
    return result

@router.get("/walker/{walker_id}")
def get_walker_bookings(walker_id: int, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(models.Booking.d_walker_id == walker_id).all()
    result = []
    for b in bookings:
        feedback_from_walker = db.query(models.Feedback).filter(
            models.Feedback.booking_id == b.booking_id,
            models.Feedback.author_role == 'dogwalker'
        ).first()
        result.append({
            "booking_id": b.booking_id,
            "service_name": b.service.serv_name,
            "client_fio": b.client.client_fio,
            "client_id": b.client_id,
            "client_phone": b.client.client_phone,
            "client_rating": b.client.client_rating,  # ← добавляем рейтинг клиента
            "address": b.address,
            "datetime": str(b.datetime),
            "book_status": b.book_status,
            "full_cost": b.full_cost,
            "has_feedback_from_walker": feedback_from_walker is not None
        })
    return result

@router.post("/{booking_id}/accept")
def accept_booking(booking_id: int, extra_cost: float = 0, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Заказ не найден")
    
    booking.book_status = 'accepted'
    if extra_cost > 0:
        booking.full_cost += extra_cost
    db.commit()
    return {"success": True}

@router.post("/{booking_id}/complete")
def complete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Заказ не найден")
    
    booking.book_status = 'completed'
    db.commit()
    return {"success": True}

@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Заказ не найден")
    
    booking.book_status = 'cancelled'
    db.commit()
    return {"success": True}


@router.get("/admin/all")
def get_all_bookings(db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).all()
    return [
        {
            "booking_id": b.booking_id,
            "service_name": b.service.serv_name,
            "client_fio": b.client.client_fio,
            "dog_name": b.dog.dog_name if b.dog else None,  # ← ДОБАВЬ ЭТО
            "walker_login": b.d_walker.d_walker_login,
            "address": b.address,
            "datetime": str(b.datetime),
            "book_status": b.book_status,
            "full_cost": b.full_cost
        }
        for b in bookings
    ]

@router.delete("/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.booking_id == booking_id).first()
    if booking:
        db.delete(booking)
        db.commit()
    return {"success": True}
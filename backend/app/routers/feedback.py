from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from pydantic import BaseModel
import datetime

router = APIRouter()

class CreateFeedbackRequest(BaseModel):
    booking_id: int
    client_id: int
    d_walker_id: int
    score: float
    text: str = ""
    author_role: str  

@router.post("/create")
def create_feedback(data: CreateFeedbackRequest, db: Session = Depends(get_db)):
    # Проверяем, есть ли уже отзыв от этого автора
    existing = db.query(models.Feedback).filter(
        models.Feedback.booking_id == data.booking_id,
        models.Feedback.author_role == data.author_role
    ).first()
    if existing:
        raise HTTPException(400, "Вы уже оставили отзыв на этот заказ")
    
    feedback = models.Feedback(
        booking_id=data.booking_id,
        client_id=data.client_id,
        d_walker_id=data.d_walker_id,
        admin_id=1,
        feedback_date=datetime.datetime.now(),
        feedback_score=data.score,
        text=data.text,
        author_role=data.author_role
    )
    db.add(feedback)
    db.commit()
    
    # Обновляем рейтинг
    if data.author_role == 'client':
        # Клиент оценил догволкера
        walker = db.query(models.Dogwalker).filter(models.Dogwalker.d_walker_id == data.d_walker_id).first()
        if walker:
            all_feedbacks = db.query(models.Feedback).filter(
                models.Feedback.d_walker_id == data.d_walker_id,
                models.Feedback.author_role == 'client'
            ).all()
            if all_feedbacks:
                walker.d_walker_rating = sum(f.feedback_score for f in all_feedbacks) / len(all_feedbacks)
                db.commit()
    else:
        # Догволкер оценил клиента
        client = db.query(models.Client).filter(models.Client.client_id == data.client_id).first()
        if client:
            all_feedbacks = db.query(models.Feedback).filter(
                models.Feedback.client_id == data.client_id,
                models.Feedback.author_role == 'dogwalker'
            ).all()
            if all_feedbacks:
                client.client_rating = sum(f.feedback_score for f in all_feedbacks) / len(all_feedbacks)
                db.commit()
    
    return {"success": True}

@router.get("/client/{client_id}")
def get_client_feedbacks(client_id: int, db: Session = Depends(get_db)):
    # Отзывы, которые КЛИЕНТ получил от догволкеров (о клиенте)
    feedbacks = db.query(
        models.Feedback,
        models.Dogwalker.d_walker_login,
        models.Booking.service_id,
        models.Booking.datetime,
        models.Service.serv_name
    ).join(
        models.Dogwalker, models.Dogwalker.d_walker_id == models.Feedback.d_walker_id
    ).join(
        models.Booking, models.Booking.booking_id == models.Feedback.booking_id
    ).join(
        models.Service, models.Service.service_id == models.Booking.service_id
    ).filter(
        models.Feedback.client_id == client_id,
        models.Feedback.author_role == 'dogwalker'  # ← отзывы от догволкеров
    ).all()
    
    return [
        {
            "feedback_id": f[0].feedback_id,
            "from": f[1],  # догволкер
            "to": "Вам",
            "service_name": f[4],
            "booking_date": str(f[3])[:10],
            "feedback_score": f[0].feedback_score,
            "text": f[0].text,
            "feedback_date": str(f[0].feedback_date)
        }
        for f in feedbacks
    ]

@router.get("/walker/{walker_id}")
def get_walker_feedbacks(walker_id: int, db: Session = Depends(get_db)):
    # Отзывы, которые ДОГВОЛКЕР получил от клиентов (о догволкере)
    feedbacks = db.query(
        models.Feedback,
        models.Client.client_fio,
        models.Booking.service_id,
        models.Booking.datetime,
        models.Service.serv_name
    ).join(
        models.Client, models.Client.client_id == models.Feedback.client_id
    ).join(
        models.Booking, models.Booking.booking_id == models.Feedback.booking_id
    ).join(
        models.Service, models.Service.service_id == models.Booking.service_id
    ).filter(
        models.Feedback.d_walker_id == walker_id,
        models.Feedback.author_role == 'client'  # ← отзывы от клиентов
    ).all()
    
    return [
        {
            "feedback_id": f[0].feedback_id,
            "from": f[1],  # клиент
            "to": "Вам",
            "service_name": f[4],
            "booking_date": str(f[3])[:10],
            "feedback_score": f[0].feedback_score,
            "text": f[0].text,
            "feedback_date": str(f[0].feedback_date)
        }
        for f in feedbacks
    ]
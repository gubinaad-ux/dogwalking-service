from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base  
from .routers import auth, bookings, clients, dogwalkers, reports, services, feedback

app = FastAPI(title="Dog Walking Service API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(dogwalkers.router, prefix="/api/dogwalkers", tags=["dogwalkers"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(services.router, prefix="/api/services", tags=["services"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])
@app.get("/")
def root():
    return {"message": "Dog Walking Service API"}

# Создание таблиц (только если их нет)
Base.metadata.create_all(bind=engine)
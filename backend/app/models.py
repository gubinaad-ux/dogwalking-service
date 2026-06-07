from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Time
from sqlalchemy.orm import relationship
from .database import Base

class Client(Base):
    __tablename__ = "client"
    client_id = Column(Integer, primary_key=True)
    client_fio = Column(String(50))
    client_phone = Column(String(10))
    client_email = Column(String(100))
    client_password = Column(String(255))  
    client_rating = Column(Float)

class Dog(Base):
    __tablename__ = "dog"
    dog_id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("client.client_id"))
    dog_name = Column(String(30))
    dog_breed = Column(String(30))
    age = Column(Integer)
    weight = Column(Integer)
    features = Column(String(256), nullable=True)
    poto = Column(String(255), nullable=True)

class Dogwalker(Base):
    __tablename__ = "dogwalker"
    d_walker_id = Column(Integer, primary_key=True)
    d_walker_login = Column(String(25))
    d_walker_password = Column(String(255))  # ← ДОБАВЬ ЭТО
    d_walker_rating = Column(Float)
    d_walker_status = Column(String(1))

class Service(Base):
    __tablename__ = "service"
    service_id = Column(Integer, primary_key=True)
    serv_name = Column(String(100))
    serv_discrib = Column(String(256), nullable=True)  
    serv_base_cost = Column(Float)

class Booking(Base):
    __tablename__ = "booking"
    booking_id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("client.client_id"))
    dog_id = Column(Integer, ForeignKey("dog.dog_id"))
    d_walker_id = Column(Integer, ForeignKey("dogwalker.d_walker_id"))
    service_id = Column(Integer, ForeignKey("service.service_id"))
    district_id = Column(Integer, ForeignKey("district.district_id"))
    address = Column(String(40))
    book_status = Column(String(10))
    book_lasting = Column(Time)
    full_cost = Column(Float)
    datetime = Column(DateTime)
    
    # Добавь эти строки
    client = relationship("Client")
    dog = relationship("Dog")
    d_walker = relationship("Dogwalker")
    service = relationship("Service")
    district = relationship("District")



class Admin(Base):
    __tablename__ = "admin"
    admin_id = Column(Integer, primary_key=True)
    admin_login = Column(String(25))
    admin_password = Column(String(30))
    admin_access = Column(String(3))


class Form(Base):
    __tablename__ = "form"
    form_id = Column(Integer, primary_key=True, autoincrement=True)  # ← добавь autoincrement
    d_walker_id = Column(Integer, ForeignKey("dogwalker.d_walker_id"))
    admin_id = Column(Integer, ForeignKey("admin.admin_id"), nullable=True)
    fio_dogwolker = Column(String(50))
    pasport_data = Column(String(30))
    phone_num = Column(String(10))
    form_email = Column(String(100))
    ver_status = Column(String(3))


class Provide(Base):
    __tablename__ = "provide"
    d_walker_id = Column(Integer, ForeignKey("dogwalker.d_walker_id"), primary_key=True)
    service_id = Column(Integer, ForeignKey("service.service_id"), primary_key=True)

class District(Base):
    __tablename__ = "district"
    district_id = Column(Integer, primary_key=True)
    district_name = Column(String(50))
    district_coef = Column(Float)

class Feedback(Base):
    __tablename__ = "feedback"
    feedback_id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("client.client_id"))
    booking_id = Column(Integer, ForeignKey("booking.booking_id"))
    d_walker_id = Column(Integer, ForeignKey("dogwalker.d_walker_id"))
    admin_id = Column(Integer, ForeignKey("admin.admin_id"))
    feedback_date = Column(DateTime)
    feedback_score = Column(Float)
    text = Column(String(256))
    author_role = Column(String(20))  # 'client' или 'dogwalker'
    
    client = relationship("Client")
    booking = relationship("Booking")
    d_walker = relationship("Dogwalker")
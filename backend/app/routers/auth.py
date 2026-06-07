from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt
import datetime
from ..database import get_db
from .. import models

router = APIRouter()
security = HTTPBearer()
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def create_token(user_id: int, role: str):
    return jwt.encode(
        {"user_id": user_id, "role": role, "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
        SECRET_KEY, algorithm=ALGORITHM
    )

@router.post("/register/client")
async def register_client(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    email = data.get('email')
    password = data.get('password')
    
    existing = db.query(models.Client).filter(models.Client.client_email == email).first()
    if existing:
        raise HTTPException(400, "Email уже зарегистрирован")
    
    client = models.Client(
        client_email=email,
        client_password=password,
        client_fio=email,
        client_phone='',
        client_rating=0
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    
    token = create_token(client.client_id, "client")
    return {"token": token, "role": "client", "user_id": client.client_id}

@router.post("/register/dogwalker")
async def register_dogwalker(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    login = data.get('login')
    password = data.get('password')
    
    existing = db.query(models.Dogwalker).filter(models.Dogwalker.d_walker_login == login).first()
    if existing:
        raise HTTPException(400, "Логин уже занят")
    
    walker = models.Dogwalker(
        d_walker_login=login,
        d_walker_password=password,
        d_walker_rating=0,
        d_walker_status='P'
    )
    db.add(walker)
    db.commit()
    db.refresh(walker)
    
    token = create_token(walker.d_walker_id, "dogwalker")
    return {"token": token, "role": "dogwalker", "user_id": walker.d_walker_id}

@router.post("/login/client")
async def login_client(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    email = data.get('email')
    password = data.get('password')
    
    client = db.query(models.Client).filter(models.Client.client_email == email).first()
    if not client or client.client_password != password:
        raise HTTPException(401, "Неверный email или пароль")
    
    token = create_token(client.client_id, "client")
    return {"token": token, "role": "client", "user_id": client.client_id}

@router.post("/login/dogwalker")
async def login_dogwalker(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    login = data.get('login')
    password = data.get('password')
    
    walker = db.query(models.Dogwalker).filter(models.Dogwalker.d_walker_login == login).first()
    if not walker or walker.d_walker_password != password:
        raise HTTPException(401, "Неверный логин или пароль")
    
    token = create_token(walker.d_walker_id, "dogwalker")
    return {"token": token, "role": "dogwalker", "user_id": walker.d_walker_id}

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return {"user_id": payload["user_id"], "role": payload["role"]}
    except:
        raise HTTPException(401, "Недействительный токен")



@router.post("/login/admin")
async def login_admin(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    login = data.get('login')
    password = data.get('password')
    
    admin = db.query(models.Admin).filter(models.Admin.admin_login == login).first()
    if not admin or admin.admin_password != password:
        raise HTTPException(401, "Неверный логин или пароль")
    
    token = create_token(admin.admin_id, "admin")
    return {"token": token, "role": "admin", "user_id": admin.admin_id}



@router.post("/form/submit")
async def submit_form(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        print("Полученные данные:", data)  
        
        walker_id = data.get('walker_id')
        fio = data.get('fio')
        passport = data.get('passport')
        phone = data.get('phone')
        email = data.get('email')
        
        print(f"walker_id: {walker_id}, fio: {fio}")  
        
        existing = db.query(models.Form).filter(models.Form.d_walker_id == walker_id).first()
        if existing:
            raise HTTPException(400, "Анкета уже отправлена")
        
        form = models.Form(
            d_walker_id=walker_id,
            admin_id=1, 
            fio_dogwolker=fio,
            pasport_data=passport,
            phone_num=phone,
            form_email=email,
            ver_status='wai'
        )
        db.add(form)
        db.commit()
        
        walker = db.query(models.Dogwalker).filter(models.Dogwalker.d_walker_id == walker_id).first()
        if walker:
            walker.d_walker_status = 'W'
            db.commit()
        
        return {"success": True}
    except Exception as e:
        print("Ошибка:", str(e))  
        raise HTTPException(400, str(e))

@router.get("/form/status/{walker_id}")
def get_form_status(walker_id: int, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.d_walker_id == walker_id).first()
    if not form:
        return {"status": "not_submitted"}
    
    if form.ver_status == 'wai':
        return {"status": "waiting"}
    elif form.ver_status == 'yes':
        return {"status": "approved"}
    elif form.ver_status == 'no':
        return {"status": "rejected"}
    else:
        return {"status": "unknown"}

@router.get("/admin/forms")
def get_forms(db: Session = Depends(get_db)):
    forms = db.query(models.Form).filter(models.Form.ver_status == 'wai').all()
    return [
        {
            "form_id": f.form_id,
            "walker_id": f.d_walker_id,
            "fio": f.fio_dogwolker,
            "passport": f.pasport_data,
            "phone": f.phone_num,
            "email": f.form_email
        }
        for f in forms
    ]

@router.post("/admin/forms/{form_id}/approve")
def approve_form(form_id: int, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.form_id == form_id).first()
    form.ver_status = 'yes'
    
    walker = db.query(models.Dogwalker).filter(models.Dogwalker.d_walker_id == form.d_walker_id).first()
    walker.d_walker_status = 'A'  # Active
    
    db.commit()
    return {"success": True}

@router.post("/admin/forms/{form_id}/reject")
def reject_form(form_id: int, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.form_id == form_id).first()
    form.ver_status = 'no'
    
    walker = db.query(models.Dogwalker).filter(models.Dogwalker.d_walker_id == form.d_walker_id).first()
    walker.d_walker_status = 'R'  # Rejected
    
    db.commit()
    return {"success": True}




@router.get("/form/info/{walker_id}")
def get_form_info(walker_id: int, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.d_walker_id == walker_id).first()
    if not form:
        return {}
    return {
        "fio": form.fio_dogwolker,
        "passport": form.pasport_data,
        "phone": form.phone_num,
        "email": form.form_email
    }

@router.get("/dogwalkers/{walker_id}/services")
def get_walker_services(walker_id: int, db: Session = Depends(get_db)):
    provides = db.query(models.Provide).filter(models.Provide.d_walker_id == walker_id).all()
    services = []
    for p in provides:
        service = db.query(models.Service).filter(models.Service.service_id == p.service_id).first()
        if service:
            services.append({
                "service_id": service.service_id, 
                "serv_name": service.serv_name, 
                "serv_discrib": service.serv_discrib,
                "serv_base_cost": service.serv_base_cost
            })
    return services


    
@router.delete("/services/{service_id}")
async def delete_service(service_id: int, db: Session = Depends(get_db)):
    db.query(models.Provide).filter(models.Provide.service_id == service_id).delete()
    service = db.query(models.Service).filter(models.Service.service_id == service_id).first()
    if service:
        db.delete(service)
    db.commit()
    return {"success": True}


@router.post("/dogwalkers/{walker_id}/add-service")
async def add_walker_service(walker_id: int, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    service_name = data.get('service_name')
    description = data.get('description', '')
    base_cost = data.get('base_cost')
    
    new_service = models.Service(
        serv_name=service_name,
        serv_discrib=description,
        serv_base_cost=base_cost
    )
    db.add(new_service)
    db.flush()  
    
    provide = models.Provide(
        d_walker_id=walker_id,
        service_id=new_service.service_id
    )
    db.add(provide)
    db.commit()
    
    return {"success": True}
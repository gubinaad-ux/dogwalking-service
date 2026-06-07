from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
from fastapi.responses import StreamingResponse
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Spacer, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import os

router = APIRouter()

font_path = "C:/Windows/Fonts/arial.ttf"
if os.path.exists(font_path):
    pdfmetrics.registerFont(TTFont('Arial', font_path))
    DEFAULT_FONT = 'Arial'
else:
    DEFAULT_FONT = 'Helvetica'

@router.get("/activity")
def get_activity_report(year: int, month: int = None, db: Session = Depends(get_db)):
    query = """
    SELECT 
        EXTRACT(MONTH FROM datetime) as month,
        COUNT(*) as bookings_count,
        SUM(full_cost) as total_income
    FROM booking
    WHERE EXTRACT(YEAR FROM datetime) = :year
    """
    params = {"year": year}
    if month:
        query += " AND EXTRACT(MONTH FROM datetime) = :month"
        params["month"] = month
    query += " GROUP BY EXTRACT(MONTH FROM datetime) ORDER BY month"
    
    result = db.execute(text(query), params)
    results = result.fetchall()
    
    return [
        {"month": int(r[0]), "count": r[1], "income": float(r[2]) if r[2] else 0}
        for r in results
    ]

@router.get("/dogwalker-rating")
def get_dogwalker_rating_report(db: Session = Depends(get_db)):
    query = """
    SELECT 
        dw.d_walker_id,
        dw.d_walker_login,
        COALESCE(AVG(f.feedback_score), 0) as avg_rating,
        COUNT(f.feedback_id) as feedback_count
    FROM dogwalker dw
    LEFT JOIN feedback f ON f.d_walker_id = dw.d_walker_id AND f.author_role = 'client'
    GROUP BY dw.d_walker_id, dw.d_walker_login
    ORDER BY avg_rating DESC
    """
    result = db.execute(text(query))
    results = result.fetchall()
    
    return [
        {
            "walker_id": r[0],
            "walker_login": r[1],
            "avg_rating": round(float(r[2]), 2),
            "feedback_count": r[3]
        }
        for r in results
    ]

@router.get("/client-rating")
def get_client_rating_report(db: Session = Depends(get_db)):
    query = """
    SELECT 
        c.client_id,
        c.client_fio,
        COALESCE(AVG(f.feedback_score), 0) as avg_rating,
        COUNT(f.feedback_id) as feedback_count
    FROM client c
    LEFT JOIN feedback f ON f.client_id = c.client_id AND f.author_role = 'dogwalker'
    GROUP BY c.client_id, c.client_fio
    ORDER BY avg_rating DESC
    """
    result = db.execute(text(query))
    results = result.fetchall()
    
    return [
        {
            "client_id": r[0],
            "client_fio": r[1],
            "avg_rating": round(float(r[2]), 2),
            "feedback_count": r[3]
        }
        for r in results
    ]

@router.get("/dogwalker-rating/pdf")
def export_dogwalker_rating_pdf(db: Session = Depends(get_db)):
    data = get_dogwalker_rating_report(db)
    table_data = [[d['walker_login'], d['avg_rating'], d['feedback_count']] for d in data]
    buffer = generate_pdf_report(
        table_data,
        "Отчет по рейтингу выгульщиков",
        ["Выгульщик", "Средний рейтинг", "Количество отзывов"]
    )
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=dogwalker_rating.pdf"})

@router.get("/client-rating/pdf")
def export_client_rating_pdf(db: Session = Depends(get_db)):
    data = get_client_rating_report(db)
    table_data = [[d['client_fio'], d['avg_rating'], d['feedback_count']] for d in data]
    buffer = generate_pdf_report(
        table_data,
        "Отчет по рейтингу клиентов",
        ["Клиент", "Средний рейтинг", "Количество отзывов"]
    )
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=client_rating.pdf"})





def generate_pdf_report(data, title, headers):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    
    styles['Title'].fontName = DEFAULT_FONT
    styles['Normal'].fontName = DEFAULT_FONT
    
    cell_style = ParagraphStyle(
        'CellStyle',
        parent=styles['Normal'],
        fontName=DEFAULT_FONT,
        fontSize=10,
        alignment=0
    )
    
    elements = []
    
    elements.append(Paragraph(title, styles['Title']))
    elements.append(Spacer(1, 0.3 * inch))
    
    table_data = [headers]
    for row in data:
        wrapped_row = [Paragraph(str(cell), cell_style) for cell in row]
        table_data.append(wrapped_row)
    
    table = Table(table_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), DEFAULT_FONT),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), DEFAULT_FONT),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
    ]))
    elements.append(table)
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
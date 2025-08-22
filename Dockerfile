FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY dashboard ./dashboard
COPY src ./src
# artifacts disimpan di volume (lihat compose), tapi aman kalau ada
COPY artifacts ./artifacts

EXPOSE 3000
# Jalankan backend
CMD ["python", "backend/app.py"]
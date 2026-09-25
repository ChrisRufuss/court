FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for PDF and Image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app/backend
COPY legal_knowledge /app/legal_knowledge
COPY demo_data /app/demo_data

ENV PYTHONPATH=/app/backend

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM python:3.10-alpine

WORKDIR /app

# Install build dependencies for psycopg2
RUN apk add --no-cache postgresql-dev gcc python3-dev musl-dev

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
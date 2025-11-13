# Gunakan image Python resmi (versi 3.9 misal)
FROM python:3.9-slim

# Set working directory di container
WORKDIR /app

# Copy file requirements.txt dan install dependencies Flask
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy semua file aplikasi ke container
COPY . .

# Expose port Flask default
EXPOSE 5000

# Jalankan Flask app
CMD ["python", "app.py"]

# Use Python 3.12 slim for a small footprint
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies (including fuser/psmisc for housekeeping)
RUN apt-get update && apt-get install -y \
    build-essential \
    psmisc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Environment variables (Defaults, override in Cloud Run)
ENV PORT=8080
ENV PYTHONPATH=/app
ENV JWT_SECRET="change-me-in-production"

# Create persistence directory
RUN mkdir -p /app/brain

# Expose the port
EXPOSE 8080

# Run uvicorn
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]

# Use Python 3.12 slim for a small footprint
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    psmisc \
    && rm -rf /var/lib/apt/lists/*

# Create and use virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create persistence directory
RUN mkdir -p /app/brain

# Copy backend application code into a subdirectory named 'backend'
COPY backend/ /app/backend/

# Environment variables
ENV PORT=8080
ENV PYTHONPATH=/app

# Expose the port
EXPOSE 8080

# Run uvicorn using the venv's python
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]

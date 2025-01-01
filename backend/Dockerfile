FROM python:3.10-bullseye

# Set the working directory
WORKDIR /usr/src/app

# Install Java
RUN apt update && apt install -y openjdk-11-jdk && \
    apt clean && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME
ENV JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64"
ENV PATH="$JAVA_HOME/bin:$PATH"

# Install dependencies for building SQLite
RUN apt update && apt install -y wget build-essential libreadline-dev \
    && wget https://www.sqlite.org/2024/sqlite-autoconf-3450300.tar.gz \
    && tar -xvf sqlite-autoconf-3450300.tar.gz \
    && cd sqlite-autoconf-3450300 \
    && ./configure --prefix=/usr/local \
    && make && make install \
    && cd .. && rm -rf sqlite-autoconf-3450300*

# Set LD_LIBRARY_PATH for Python to reference the correct SQLite version
ENV LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH"

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose port and start the application
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

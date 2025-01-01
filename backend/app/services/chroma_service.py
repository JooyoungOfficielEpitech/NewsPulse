from chromadb.config import Settings
from chromadb import Client

def get_chroma_client():
    settings = Settings(
        chroma_db_impl="postgres",
        postgres_host="postgres",
        postgres_port="5432",
        postgres_user="newspulse_user",
        postgres_password="bV0_cCo-",
        postgres_database="newspulse_db",
    )
    return Client(settings)

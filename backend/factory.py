import psycopg2
from langchain.schema import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import os

load_dotenv()

# PostgreSQL 연결 설정
db_config = {
    "dbname": "newspulse_db",  # Replace with your DB name
    "user": "newspulse_user",        # Replace with your username
    "password": "bV0_cCo-",    # Replace with your password
    "host": "localhost",            # Replace with your DB host
    "port": "5432"                  # Default PostgreSQL port
}

openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY is not set in the environment variables.")
print(openai_api_key)

def fetch_news_from_db():
    """
    PostgreSQL 데이터베이스에서 'news' 테이블의 데이터를 가져옵니다.
    """
    
    
    connection = psycopg2.connect(**db_config)
    cursor = connection.cursor()

    try:
        # "news" 테이블에서 title과 description 가져오기
        cursor.execute("SELECT title, description FROM news")
        rows = cursor.fetchall()

        # 데이터를 LangChain Document 형식으로 변환
        documents = [
            Document(page_content=f"Title: {row[0]}\n\nDescription: {row[1]}")
            for row in rows
        ]
    finally:
        cursor.close()
        connection.close()

    return documents

def setup_vectorstore(documents):
    """
    크롤링된 문서를 기반으로 LangChain의 벡터스토어를 생성합니다.
    """
    # 텍스트 분리
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)

    # 벡터스토어 생성
    vectorstore = Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())
    return vectorstore

def format_docs(docs):
    """
    검색된 문서를 문자열로 포맷팅합니다.
    """
    return "\n\n".join(doc.page_content for doc in docs)

def create_rag_chain(vectorstore):
    """
    RAG 체인을 생성합니다.
    """
    # 리트리버 설정
    retriever = vectorstore.as_retriever()

    # 프롬프트 설정
    prompt_template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.

    Question: {question} 

    Context: {context} 

    Answer:
    """
    prompt = PromptTemplate.from_template(prompt_template)
    
    print("중간 검검  : ", retriever)

    # RAG 체인 생성
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | ChatOpenAI(model="gpt-4o", temperature=0, max_tokens=None)
        | StrOutputParser()
    )
    return rag_chain

if __name__ == "__main__":
    # PostgreSQL에서 데이터를 가져옵니다.
    print("Fetching news data from PostgreSQL...")
    documents = fetch_news_from_db()
    print(f"Fetched {len(documents)} documents.")

    # 벡터스토어 설정
    print("Setting up vectorstore...")
    vectorstore = setup_vectorstore(documents)

    # RAG 체인 생성
    print("Creating RAG chain...")
    rag_chain = create_rag_chain(vectorstore)

    # 사용자 입력을 받아 질문-응답 실행
    print("RAG system is ready. Type your question below!")
    while True:
        query = input("Enter your question: ")
        if query.lower() in ("exit", "quit"):
            print("Exiting...")
            break
        print(query)
        result = rag_chain.invoke(query)
        print("Answer:", result)
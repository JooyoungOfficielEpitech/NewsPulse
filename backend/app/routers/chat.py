from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.chat_service import save_chat_message, get_chat_history, delete_chat_history
from app.services.rag_chain import build_rag_chain
from app.database import async_get_db
from app.services.redis_client import redis_client
import pickle
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from app.database import SessionLocal
from sqlalchemy.future import select
from app.models.news import News
from app.models.user import User
from app.dependencies import get_current_user





# 임시

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

db_config = {
    "dbname": "newspulse_db",  
    "user": "newspulse_user",        
    "password": "bV0_cCo-",    
    "host": "localhost",            
    "port": "5432"              
}

def fetch_news_from_db(user_id):
    """
    PostgreSQL 데이터베이스에서 'news' 테이블의 데이터를 가져옵니다.
    """
    
    db: AsyncSession = SessionLocal()

    try:
        # "news" 테이블에서 title과 description 가져오기
        result = db.execute(select(News).filter(News.user_id == user_id))
        rows = [r for r in result.all()]
        
        print(f"DOCUMENT len : {len(rows)}")

        # 데이터를 LangChain Document 형식으로 변환
        documents = [
            Document(page_content=f"Title: {row[0].title}\n\nDescription: {row[0].description}")
            for row in rows
        ]
    except Exception as e:
        print(e)

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


# 임시

router = APIRouter()


@router.post("/query")
async def query(user_id: int, question: str, db: AsyncSession = Depends(async_get_db), user: User = Depends(get_current_user)):
    """
    Handles user queries and returns answers using the RAG chain mechanism with hardcoded context.
    """
    # persist_directory = redis_client.get(f"user_vectorstore:{user_id}")
    # if not persist_directory:
    #     raise HTTPException(status_code=404, detail="Vector store not found in Redis.")

    # # VectorStore Load
    # vectorstore = Chroma(
    #     collection_name=f"user_{user_id}_news",
    #     persist_directory=persist_directory.decode("utf-8"),
    #     embedding_function=OpenAIEmbeddings(),
    # )

    # # Build RAG Chain
    # try:
    #     rag_chain = build_rag_chain(vectorstore)
    # except Exception as e:
    #     print(f"Error building RAG chain: {e}")
    #     raise HTTPException(status_code=500, detail="Failed to build RAG chain.")

    # # Hardcoded context and question
    # hardcoded_context = (
    #     "돼지등뼈콩국 연잎밥 합자젓국 장어탕…전 세계인의 입맛을 사로잡은 '한국인의 밥상'\n\n"
    #     "오늘 레스 씨가 배울 요리는 평창에서 즐겨 먹는 돼지등뼈콩국! 돼지 뼈를 푹 고아 살을 "
    #     "일일이 발라내는 건 물론, 물에 불려 곱게 간 콩과 초벌 양념한 배추를 넣고 정성스레 끓여낸다."
    # )
    # hardcoded_question = "돼지등뼈콩국이란 무엇인가?"

    # # Test Input Data
    # input_data = {"context": hardcoded_context, "question": hardcoded_question}
    # print(f"Test Input for RAG Chain: {input_data}")

    # try:
    #     # Debugging input processing
    #     formatted_context = input_data["context"]
    #     formatted_question = input_data["question"]
    #     print(f"Formatted Context: {formatted_context}")
    #     print(f"Formatted Question: {formatted_question}")

    #     # Ensure the input data is correct for invoke
    #     print("Running rag_chain.invoke...")
    #     answer = rag_chain.invoke({
    #         "context": formatted_context,
    #         "question": formatted_question,
    #     })

    # except Exception as e:
    #     print(f"Error during RAG chain execution: {e}")
    #     raise HTTPException(status_code=500, detail="Failed to execute RAG chain.")

    # await save_chat_message(db, user_id, hardcoded_question, is_user=True)
    # await save_chat_message(db, user_id, answer, is_user=False)
    
    documents = fetch_news_from_db(user.id)
    print(len(documents))
    # print(documents)
    vectorstore = setup_vectorstore(documents)
    rag_chain = create_rag_chain(vectorstore)
    answer = rag_chain.invoke(question)

    return {"response": answer}



@router.delete("/chat-history")
async def clear_chat_history(user_id: int, db: AsyncSession = Depends(async_get_db)):
    """
    Clears the chat history for the given user.

    Args:
        user_id (int): The ID of the user whose chat history will be cleared.
        db (AsyncSession): Database session dependency.

    Returns:
        dict: Confirmation message.
    """
    await delete_chat_history(db, user_id)
    return {"message": "Chat history cleared."}

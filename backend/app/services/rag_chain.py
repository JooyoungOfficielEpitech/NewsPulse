from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

def format_docs(docs):
    """
    검색된 문서를 문자열로 포맷팅합니다.
    """
    return "\n\n".join(doc.page_content for doc in docs)

def build_rag_chain(vectorstore):
    retriever = vectorstore.as_retriever()

    # 프롬프트 템플릿
    prompt_template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.

    Question: {question} 

    Context: {context} 

    Answer:
    """
    prompt = PromptTemplate.from_template(prompt_template)

    # RAG 체인 구성
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | ChatOpenAI(model="gpt-4o", temperature=0, max_tokens=None)
        | StrOutputParser()
    )
    return rag_chain

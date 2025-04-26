from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os

load_dotenv()

# Simple prompt template that includes a context and a user question
prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=
    """You are a helpful assistant.
Given the following context:
{context}

Answer the following question:
{question}"""
)

global_context=[]

# Create an LLM chain that uses the OpenAI API
llm = ChatGoogleGenerativeAI(
            model='gemini-2.0-flash-exp',
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
            api_key=os.getenv("GOOGLE_API_KEY"),
        )
chain = prompt | llm

def query_with_context(context: str, question: str) -> str:
    """Return the LLM's answer to 'question' given 'context'."""
    global_context.append(context)
    return chain.invoke({"context": global_context, "question": question}).content

if __name__ == "__main__":
    # Example usage
    context_text = "LangChain simplifies building LLM-powered applications."
    user_question = "What does LangChain do?"
    answer = query_with_context(context_text, user_question)
    print("Answer:", answer)
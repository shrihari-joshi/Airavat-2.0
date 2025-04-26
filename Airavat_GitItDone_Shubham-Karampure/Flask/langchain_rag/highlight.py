from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os

load_dotenv()

# Define the prompt template
prompt = PromptTemplate(
    input_variables=["context", "highlight"],
    template="""
You are a helpful assistant.
Given the following context:
{context}

Explain the meaning of the highlighted keyword or what it means in this context:
{highlight}
"""
)

# Initialize the LLM
llm = ChatGoogleGenerativeAI(
    model='gemini-2.0-flash-exp',
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    api_key=os.getenv("GOOGLE_API_KEY"),
)

# Combine the prompt and LLM
chain = prompt | llm

def explain_highlight(context: str, highlight: str) -> str:
    """Return the explanation of the highlight keyword based on the context."""
    return chain.invoke({"context": context, "highlight": highlight}).content

if __name__ == "__main__":
    # Example usage
    context_text = "LangChain is a framework for building applications powered by large language models (LLMs)."
    highlight_keyword = "LangChain"
    explanation = explain_highlight(context_text, highlight_keyword)
    print("Explanation:", explanation)
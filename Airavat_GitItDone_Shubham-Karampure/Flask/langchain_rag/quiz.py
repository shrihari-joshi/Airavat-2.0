from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os
import json

load_dotenv()

class QuizGenerator:
    def __init__(self, api_key=None):
        """
        Initialize the QuizGenerator with Google's Gemini model.
        
        Args:
            api_key: Google API key (optional, will use environment variable if not provided)
        """
        self.llm = ChatGoogleGenerativeAI(
            model='gemini-2.0-flash-exp',
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
            api_key=api_key or os.getenv("GOOGLE_API_KEY"),
        )
        
        # Quiz generation prompt template
        self.quiz_prompt = PromptTemplate(
            template="""Generate a quiz based on the following context and requirements:

CONTEXT:
{context}

QUIZ REQUIREMENTS:
- Topic: {topic}
- Total Questions: {num_questions}
- Difficulty: {difficulty}
- Duration: {duration} minutes

Create multiple-choice questions with exactly 4 options (a, b, c, d) and mark the correct answer.
Return ONLY valid JSON in this format:
{{
  "quiz": [
    {{
      "question": "Question text",
      "options": {{
        "a": "Option A",
        "b": "Option B", 
        "c": "Option C", 
        "d": "Option D"
      }},
      "answer": "a"
    }}
  ]
}}

Generate exactly {num_questions} questions. Do not include any text outside the JSON.
""",
            input_variables=["context", "topic", "num_questions", "difficulty", "duration"]
        )
        
    def generate_quiz(self, context, topic, num_questions=5, difficulty="mixed", duration=10):
        """
        Generate a quiz based on provided context.
        
        Args:
            context: The context/material to base the quiz on
            topic: The quiz topic/title
            num_questions: Number of questions to generate (default: 5)
            difficulty: Difficulty level (easy, medium, hard, or mixed) (default: mixed)
            duration: Quiz duration in minutes (default: 10)
            
        Returns:
            Dictionary containing the generated quiz
        """
        # Generate the quiz using the LLM
        chain = self.quiz_prompt | self.llm
        
        result = chain.invoke({
            "context": context,
            "topic": topic,
            "num_questions": num_questions,
            "difficulty": difficulty,
            "duration": duration
        })
        
        # Process and clean the response
        content = result.content
        
        # Try to extract valid JSON
        try:
            # First attempt: direct parsing
            quiz_data = json.loads(content)
            return quiz_data
        except json.JSONDecodeError:
            # Second attempt: extract JSON between curly braces
            try:
                start = content.find('{')
                end = content.rfind('}') + 1
                if start >= 0 and end > start:
                    json_str = content[start:end]
                    quiz_data = json.loads(json_str)
                    return quiz_data
            except:
                pass
            
            # If all parsing fails, return an error message
            return {
                "error": "Failed to generate valid quiz",
                "raw_response": content[:500] + "..." if len(content) > 500 else content
            }


# Example usage
if __name__ == "__main__":
    # Sample context about machine learning
    ml_context = """
    Machine learning is a branch of artificial intelligence that focuses on building systems that learn from data.
    Supervised learning uses labeled training data to learn the mapping function from the input variables to the output variable.
    Unsupervised learning uses unlabeled training data to model the underlying structure of the data.
    Reinforcement learning is about taking suitable actions to maximize reward in a particular situation.
    Deep learning is part of machine learning based on artificial neural networks with multiple layers.
    """
    
    # Create quiz generator and generate a quiz
    quiz_gen = QuizGenerator()
    quiz = quiz_gen.generate_quiz(
        context=ml_context,
        topic="Introduction to Machine Learning",
        num_questions=2,
        difficulty="easy",
        duration=5
    )
    
    # Print the generated quiz
    print(json.dumps(quiz, indent=2))
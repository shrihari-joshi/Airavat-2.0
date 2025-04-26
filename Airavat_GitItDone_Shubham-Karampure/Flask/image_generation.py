from together import Together
from dotenv import load_dotenv
import os

def generate_image(prompt, model="black-forest-labs/FLUX.1-schnell-Free", steps=1):
    """
    Generate a single image using the Together AI API and return its URL.
    
    Args:
        prompt (str): Text description for image generation
        model (str): Model to use for generation
        steps (int): Number of inference steps (1-4 for FLUX)
        
    Returns:
        str: URL of the generated image
    """
    load_dotenv()
    
    # Initialize client and generate one image
    client = Together(api_key=os.getenv("TOGETHER_API_KEY"))
    response = client.images.generate(
        prompt=prompt,
        model=model,
        steps=steps,
        n=1  # Generate only one image
    )
    
    # Extract the single image URL
    image_url = response.data[0].url
    return image_url

if __name__ == "__main__":
    # Example usage
    prompt = """Manga-style Isaac Newton under a tree in 17th-century clothes, thoughtful. 
    A shiny apple falls toward his head with speed lines, impact effects, dramatic expression, 
    shaded background, and falling leaves."""
    
    image_url = generate_image(prompt)
    print(f"Generated image URL successfully!")
    print(image_url)
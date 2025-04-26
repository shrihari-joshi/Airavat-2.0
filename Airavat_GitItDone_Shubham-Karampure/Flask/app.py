# app.py (Combined Server)
import os
import json
import traceback
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# Import functionalities from your separate logic files
from text_generation import WikiComicGenerator # Now includes narration generation
from image_generation import generate_image
from langchain_rag.context import query_with_context
from langchain_rag.highlight import explain_highlight
from video.video_gen import generate_video
from langchain_rag.quiz import QuizGenerator
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv
import time
import requests
import tempfile
load_dotenv()  

# Config with your account details
cloudinary.config( 
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'), 
  api_key = os.getenv('CLOUDINARY_API_KEY'), 
  api_secret = os.getenv('CLOUDINARY_API_SECRET'), 
)



# --- Flask Server Setup ---
app = Flask(__name__)
CORS(app) # Enable CORS

# --- Initialization (Run Once on Startup) ---
generator_instance = None
try:
    # Instantiate the generator which now initializes all agents
    generator_instance = WikiComicGenerator()
    print("WikiComicGenerator (including agents) initialized.")
except Exception as e:
    print(f"FATAL: Failed to initialize WikiComicGenerator or its agents: {e}")
    print(traceback.format_exc())
    # generator_instance remains None, routes will handle this

# --- API Routes ---

# Route for Comic Generation
@app.route('/generate_comic', methods=['POST'])
def generate_comic_api():
    if generator_instance is None or generator_instance.wiki_researcher is None: # Check a required agent
        print("Error: Comic Generation service is unavailable due to initialization failure.")
        return jsonify({"error": "Comic generation service is unavailable."}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON payload received."}), 400

        topic = data.get('topic')
        # ... (extract other parameters: domain, complexity, age, education, style)
        domain = data.get('domain', 'general')
        complexity_level = data.get('complexity', 'medium')
        age_group = data.get('age', 'teens')
        education_level = data.get('education', 'middle_school')
        comic_style = data.get('style', 'educational')

        if not topic:
            return jsonify({"error": "Missing 'topic' in the request."}), 400

        # Call the generate_comic method
        result = generator_instance.generate_comic(
            topic=topic,
            domain=domain,
            complexity_level=complexity_level,
            age_group=age_group,
            education_level=education_level,
            comic_style=comic_style
        )

        # Handle result (error or success)
        if isinstance(result, dict) and "error" in result:
            print(f"Comic generation failed for topic '{topic}': {result.get('error')}")
            status_code = 500 # Internal Server Error generally
            if "parsing failed" in result.get("error", ""):
                 status_code = 502 # Bad Gateway might indicate upstream LLM issues
            return jsonify(result), status_code
        elif isinstance(result, dict): # Successful JSON output
            print(f"Successfully generated comic JSON for topic: {topic}")
            return jsonify(result), 200
        else:
            # Handle unexpected non-dict, non-error results if necessary
            print(f"Warning: Comic generation returned unexpected format for topic '{topic}': {type(result)}")
            return jsonify({"error": "Unexpected result format from comic generation.", "details": str(result)}), 500


    except Exception as e:
        print(f"API Error in /generate_comic: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "An internal server error occurred during comic generation.", "details": str(e)}), 500

# <<< NEW ROUTE for YouTube Shorts Narration >>>
@app.route('/generate_short_narration', methods=['POST'])
def generate_short_narration_api():
    # Check if the generator and the specific agent are initialized
    if generator_instance is None or generator_instance.youtube_shorts_scriptwriter is None:
        print("Error: YouTube Shorts Narration service is unavailable due to initialization failure.")
        return jsonify({"error": "YouTube Shorts Narration service is unavailable."}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON payload received."}), 400

        # Expecting the comic script (as text or JSON string) in the request
        comic_script = data.get('comic_script')
        print(comic_script)

        if not comic_script:
            return jsonify({"error": "Missing 'comic_script' in the request."}), 400

        # Call the new generate_short_narration method
        narration_result = generator_instance.generate_short_narration(
            comic_script=comic_script
        )

        # Handle result
        if "Error:" in narration_result:
            print(f"Narration generation failed: {narration_result}")
            # Determine appropriate status code based on error
            status_code = 500
            if "not available" in narration_result:
                 status_code = 503 # Service Unavailable
            return jsonify({"error": narration_result}), status_code
        else:
            print("Successfully generated YouTube Short narration.")
            # Return the narration text
            return jsonify({"narration": narration_result}), 200

    except Exception as e:
        print(f"API Error in /generate_short_narration: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "An internal server error occurred during narration generation.", "details": str(e)}), 500


@app.route('/explain_highlight', methods=['POST'])
def explain_highlight_api():
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "Invalid JSON."}), 400
        context = data.get('context')
        highlight = data.get('highlight')
        if not context or not highlight: return jsonify({"error": "Missing 'context' or 'highlight'."}), 400
        explanation = explain_highlight(context, highlight) # Function from langchain_rag.highlight
        print(f"Explanation generated for: '{highlight}'")
        return jsonify({"explanation": explanation}), 200
    except Exception as e:
        print(f"API Error in /explain_highlight: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error.", "details": str(e)}), 500

@app.route('/generate_video', methods=['POST'])
def generate_video_api():
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "Invalid JSON."}), 400

        texts = data.get('texts')
        image_urls = data.get('image_urls')
        subtitle_style = data.get('subtitle_style', 'captions_ai') # Default to new style
        output_filename = data.get('output_filename', 'output.mp4')

        if not texts or not isinstance(texts, list): return jsonify({"error": "'texts' must be a list."}), 400
        if not image_urls or not isinstance(image_urls, list): return jsonify({"error": "'image_urls' must be a list."}), 400
        if len(texts) != len(image_urls): return jsonify({"error": "Number of texts must match image URLs."}), 400

        # Create output directory if it doesn't exist
        output_dir = os.path.join(os.path.dirname(__file__), "uploads")
        if not os.path.exists(output_dir): os.makedirs(output_dir)
        output_path = os.path.join(output_dir, output_filename)

        print(f"Generating video with {len(texts)} segments (Style: {subtitle_style})...")
        # Generate the video
        generate_video(texts, image_urls, output_path=output_path, subtitle_style=subtitle_style)

        print(f"Video generated at {output_path}, uploading to Cloudinary...")
        
        # Upload the video to Cloudinary
        try:
            # Set resource_type to 'video' for video uploads
            upload_result = cloudinary.uploader.upload(
                output_path,
                resource_type="video",
                folder="comic_videos",  # Optional: store in a specific folder
                public_id=f"comic_video_{int(time.time())}",  # Unique identifier
                overwrite=True,
                tags=['comic_video', 'airavat']  # Optional: add tags for organization
            )
            
            # Get the secure URL from the upload result
            video_url = upload_result.get('secure_url')
            
            if not video_url:
                raise Exception("Failed to get secure URL from Cloudinary upload")
                
            print(f"Video uploaded to Cloudinary: {video_url}")
            
            # Return the Cloudinary URL and other relevant info
            return jsonify({
                "success": True,
                "video_url": video_url,
                "cloudinary_public_id": upload_result.get('public_id'),
                "duration": upload_result.get('duration'),
                "filename": output_filename,
                "format": upload_result.get('format', 'mp4'),
                "resource_type": upload_result.get('resource_type', 'video')
            }), 200
            
        except Exception as cloud_error:
            print(f"Cloudinary upload error: {cloud_error}")
            print(traceback.format_exc())
            
            # Fall back to direct file serving if Cloudinary upload fails
            print(f"Falling back to direct file serving: {output_path}")
            return send_file(
                output_path,
                mimetype='video/mp4',
                as_attachment=True,
                download_name=output_filename
            )

    except Exception as e:
        print(f"API Error in /generate_video: {e}")
        print(traceback.format_exc())
        return jsonify({
            "error": "An error occurred while generating the video.",
            "details": str(e)
        }), 500

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz_api():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON payload received."}), 400

        context = data.get('context')
        topic = data.get('topic')
        num_questions = data.get('num_questions', 2)
        difficulty = data.get('difficulty', 'mixed')
        duration = data.get('duration', 10)

        if not context or not topic:
            return jsonify({"error": "Missing 'context' or 'topic' in the request."}), 400

        # Use the dedicated QuizGenerator class instead of WikiComicGenerator
        quiz_generator = QuizGenerator()
        quiz_data = quiz_generator.generate_quiz(
            context=context,
            topic=topic,
            num_questions=num_questions,
            difficulty=difficulty,
            duration=duration
        )

        # Return the quiz data
        return jsonify(quiz_data), 200

    except Exception as e:
        print(f"API Error in /generate_quiz: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "An internal server error occurred.", "details": str(e)}), 500

# Also add a route to serve existing videos by filename
@app.route('/video/<filename>', methods=['GET'])
def get_video(filename):
    try:
        video_path = os.path.join(os.path.dirname(__file__), "uploads", filename)
        if not os.path.exists(video_path): return jsonify({"error": "Video not found"}), 404
        return send_file(video_path, mimetype='video/mp4')
    except Exception as e:
        print(f"Error serving video {filename}: {e}")
        return jsonify({"error": "Failed to serve video"}), 500

@app.route('/get_details', methods=['POST'])
def get_details_api():
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "Invalid JSON."}), 400
        context = data.get('context')
        question = data.get('question')
        if not context or not question: return jsonify({"error": "Missing 'context' or 'question'."}), 400
        answer = query_with_context(context, question) # Function from langchain_rag.context
        print(f"Answer generated for: '{question}'")
        return jsonify({"answer": answer}), 200
    except Exception as e:
        print(f"API Error in /get_details: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error.", "details": str(e)}), 500

@app.route('/generate_image', methods=['POST'])
def generate_image_api():
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "Invalid JSON payload."}), 400
        prompt = data.get('prompt')
        if isinstance(prompt, str):
            if not prompt: return jsonify({'error': 'Prompt cannot be empty.'}), 400
            try:
                # Generate image with original function first
                original_image_url = generate_image(prompt)
                
                # Upload the image to Cloudinary
                try:
                    # Download the image first
                    response = requests.get(original_image_url, stream=True)
                    if response.status_code != 200:
                        raise Exception(f"Failed to download image from original URL, status: {response.status_code}")
                    
                    # Create a temporary file
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                        temp_path = temp_file.name
                        # Write the image content to the temp file
                        for chunk in response.iter_content(chunk_size=1024):
                            if chunk:
                                temp_file.write(chunk)
                    
                    # Upload to Cloudinary
                    upload_result = cloudinary.uploader.upload(
                        temp_path,
                        folder="comic_images",
                        public_id=f"comic_image_{int(time.time())}_{hash(prompt)%10000}",
                        overwrite=True,
                        tags=['comic_image', 'airavat']
                    )
                    
                    # Get Cloudinary URL
                    cloudinary_url = upload_result.get('secure_url')
                    if not cloudinary_url:
                        raise Exception("Failed to get secure URL from Cloudinary upload")
                    
                    print(f"Image uploaded to Cloudinary: {cloudinary_url}")
                    
                    # Clean up the temporary file
                    os.unlink(temp_path)
                    
                    # Return the Cloudinary URL
                    return jsonify({
                        'prompt': prompt, 
                        'image_url': cloudinary_url,
                        'original_url': original_image_url,
                        'cloudinary_public_id': upload_result.get('public_id')
                    }), 200
                    
                except Exception as cloud_error:
                    print(f"Cloudinary upload error: {cloud_error}")
                    print(traceback.format_exc())
                    # Fall back to original URL if Cloudinary upload fails
                    return jsonify({
                        'prompt': prompt, 
                        'image_url': original_image_url,
                        'cloudinary_error': str(cloud_error)
                    }), 200
                
            except Exception as e:
                print(f"Image generation failed for prompt '{prompt[:50]}...': {e}")
                return jsonify({'prompt': prompt, 'error': f"Failed to generate image: {str(e)}",'image_url': None}), 500

        elif isinstance(prompt, list):
            # Handle batch processing for multiple prompts
            responses = []
            for p in prompt:
                if not p or not isinstance(p, str):
                    responses.append({'prompt': p, 'error': 'Invalid prompt (empty or not a string).', 'image_url': None})
                    continue
                try:
                    # Generate original image
                    original_image_url = generate_image(p)
                    
                    # Upload to Cloudinary
                    try:
                        # Download the image
                        response = requests.get(original_image_url, stream=True)
                        if response.status_code != 200:
                            raise Exception(f"Failed to download image, status: {response.status_code}")
                        
                        # Create a temporary file
                        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                            temp_path = temp_file.name
                            for chunk in response.iter_content(chunk_size=1024):
                                if chunk:
                                    temp_file.write(chunk)
                        
                        # Upload to Cloudinary
                        upload_result = cloudinary.uploader.upload(
                            temp_path,
                            folder="comic_images",
                            public_id=f"comic_image_{int(time.time())}_{hash(p)%10000}",
                            overwrite=True,
                            tags=['comic_image', 'airavat']
                        )
                        
                        # Clean up
                        os.unlink(temp_path)
                        
                        # Get Cloudinary URL
                        cloudinary_url = upload_result.get('secure_url')
                        if not cloudinary_url:
                            raise Exception("Failed to get Cloudinary URL")
                        
                        responses.append({
                            'prompt': p, 
                            'image_url': cloudinary_url,
                            'original_url': original_image_url,
                            'cloudinary_public_id': upload_result.get('public_id')
                        })
                        
                    except Exception as cloud_error:
                        print(f"Cloudinary upload error for prompt '{p[:30]}...': {cloud_error}")
                        # Fall back to original URL
                        responses.append({
                            'prompt': p, 
                            'image_url': original_image_url,
                            'cloudinary_error': str(cloud_error)
                        })
                        
                except Exception as e:
                    responses.append({'prompt': p, 'error': f"Failed to generate image: {str(e)}", 'image_url': None})
                    print(f"Image generation failed for prompt '{p[:50]}...': {e}")
            
            return jsonify(responses), 200
        else:
            return jsonify({'error': 'Invalid "prompt". Expected string or list.'}), 400

    except Exception as e:
        print(f"API Error in /generate_image: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error processing image request.", "details": str(e)}), 500


# --- Main Execution Block ---
if __name__ == "__main__":
    print("Starting Combined Flask server...")
    port = int(os.environ.get("PORT", 5001)) # Use environment variable or default
    use_debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"

    print(f"Running on http://0.0.0.0:{port}/ (Debug Mode: {use_debug})")
    # Use Flask's development server:
    app.run(debug=use_debug, host='0.0.0.0', port=port)
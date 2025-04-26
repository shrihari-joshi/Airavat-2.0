const GENAI_API_URL = 'http://localhost:5001'; // or use env var

// --- Existing generateComic function ---
export async function generateComic(params) {
    try {
        setLoading(true);

        const response = await fetch(`${GENAI_API_URL}/generate_comic`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Comic generation failed');
        }

        return data; // Returns the full comic JSON object
    } catch (error) {
        setError(error.message);
        throw error; // Re-throw the error for the caller to handle if needed
    } finally {
        setLoading(false);
    }
}

// --- Existing generateImage function ---
export async function generateImage(prompt) {
    try {
        setLoading(true);

        const response = await fetch(`${GENAI_API_URL}/generate_image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }), // Send prompt inside an object
        });

        const data = await response.json();
        console.log("Image Gen Response Data:", data); // Log the full response for debugging

        if (!response.ok) {
             // Try to get a more specific error from the response if available
            const errorMessage = data.error || `Image generation failed with status: ${response.status}`;
            throw new Error(errorMessage);
        }
        // Handle potential errors even in successful responses if image_url is missing
        if (!data.image_url) {
            throw new Error(data.error || 'Image generation succeeded but no URL was returned.');
        }

        return data.image_url; // Return just the image URL
    } catch (error) {
        setError(error.message); // Log the error
        throw error; // Re-throw the error
    } finally {
        setLoading(false);
    }
}

// --- NEW function for Narration Generation ---
export async function generateShortNarration(comicScript) {
    // Input validation: Ensure comicScript is a non-empty string
    if (!comicScript || typeof comicScript !== 'string' || comicScript.trim() === '') {
        const errorMsg = 'Invalid input: comicScript must be a non-empty string.';
        setError(errorMsg);
        throw new Error(errorMsg); // Throw immediately for invalid input
    }

    try {
        setLoading(true);
        console.log("Requesting narration generation..."); // Log start

        const response = await fetch(`${GENAI_API_URL}/generate_short_narration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Send the comic script string inside a JSON object with the key "comic_script"
            body: JSON.stringify({ comic_script: comicScript }),
        });

        const data = await response.json();
        console.log("Narration Gen Response Data:", data); // Log the response

        if (!response.ok) {
            // Use the error message from the backend response if available
            throw new Error(data.error || `Narration generation failed with status: ${response.status}`);
        }

        // Check if the expected 'narration' key exists in the successful response
        if (!data.narration) {
             throw new Error('Narration generation succeeded but narration text is missing in the response.');
        }

        // Return the narration text
        return data.narration;

    } catch (error) {
        setError(error.message); // Log the error via the setError function
        console.error("Narration Generation Fetch Error:", error); // Extra console log for debugging
        throw error; // Re-throw the error so the calling component knows about it
    } finally {
        setLoading(false);
        console.log("Narration generation request finished."); // Log end
    }
}
export async function generateVideo(texts, imageUrls, outputFilename = 'comic_reel.mp4', subtitleStyle = 'captions_ai') {
    // Input validation
    if (!Array.isArray(texts) || !Array.isArray(imageUrls) || texts.length === 0 || texts.length !== imageUrls.length) {
        const errorMsg = 'Invalid input: texts and imageUrls must be non-empty arrays of the same length.';
        setError(errorMsg);
        throw new Error(errorMsg);
    }
    if (typeof outputFilename !== 'string' || outputFilename.trim() === '') {
        outputFilename = 'comic_reel.mp4'; // Default filename if invalid
    }

    try {
        setLoading(true);
        console.log("Requesting video generation...");

        const response = await fetch(`${GENAI_API_URL}/generate_video`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                texts: texts,
                image_urls: imageUrls,
                subtitle_style: subtitleStyle,
                output_filename: outputFilename
            }),
        });
        
        console.log("Video Gen Response:", response);
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `Video generation failed with status: ${response.status}` };
            }
            throw new Error(errorData.error || `Video generation failed with status: ${response.status}`);
        }

        // Parse the JSON response from the server
        const responseData = await response.json();
        console.log("Response Data:", responseData);
        
        // Check if we got a Cloudinary URL
        if (responseData.success && responseData.video_url) {
            // Create an object with all the video information
            const videoData = {
                videoUrl: responseData.video_url,
                filename: outputFilename,
                cloudinaryPublicId: responseData.cloudinary_public_id,
                format: responseData.format || 'mp4',
                duration: responseData.duration || 0,
                timestamp: Date.now(),
                success: true
            };
            
            // Save to localStorage for persistence and access from other components
            localStorage.setItem('generatedVideo', JSON.stringify(videoData));
            
            console.log("Video data saved to localStorage:", videoData);
            
            return videoData;
        } else {
            throw new Error("Video was generated but the URL was not returned properly");
        }
    } catch (error) {
        setError(error.message);
        console.error("Video Generation Error:", error);
        throw error;
    } finally {
        setLoading(false);
        console.log("Video generation request finished.");
    }
}

// --- Mock/Placeholder functions for setLoading and setError ---
// Replace these with your actual state management logic (e.g., React useState)
function setLoading(isLoading) {
    // Example: document.getElementById('loading-spinner').style.display = isLoading ? 'block' : 'none';
    console.log("Set Loading State:", isLoading);
}

function setError(error) {
    // Example: document.getElementById('error-message').innerText = error;
    console.error("Set Error State:", error);
}
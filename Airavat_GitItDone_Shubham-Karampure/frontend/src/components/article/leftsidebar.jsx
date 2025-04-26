"use client"
import { useState, useEffect } from "react"
import { Video, BookOpen, Palette, ArrowLeft } from 'lucide-react'

// Assuming these are correctly imported and function as expected
import { generateShortNarration, generateVideo } from "@/api/genApi"

// Mock or ensure these functions are correctly defined elsewhere
// These might interact with a parent component or global state
function setLoading(isLoading) {
  console.log("External Set Loading State:", isLoading)
}
function setError(error) {
  console.error("External Set Error State:", error)
}

const LeftSidebar = ({ onViewChange, currentView }) => {
  const [currentStyle, setCurrentStyle] = useState("Marvel")
  const [comicData, setComicData] = useState(null)
  const [isProcessingReel, setIsProcessingReel] = useState(false)
  const [reelError, setReelError] = useState(null)
  const [videoData, setVideoData] = useState(null) // Ensure initial state is suitable


  const handlePostSave = async () => {
    if (!comicData) {
      alert("No comic data available to save!");
      return;
    }

    try {
      // Set loading state
      setLoading(true);

      // Get user email from localStorage
      const userDataString = localStorage.getItem('user');
      if (!userDataString) {
        alert("Please log in to save your comic blog.");
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userDataString);
      const userEmail = userData.email;

      if (!userEmail) {
        alert("User email not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Debug log the comic data structure
      console.log("Comic data structure:", comicData);

      // Ensure each chapter has all required fields
      const validatedChapters = comicData.chapters.map((chapter, index) => {
        return {
          chapter_number: chapter.chapter_number || index + 1,
          chapter_title: chapter.chapter_title || `Chapter ${index + 1}`,
          chat_bubbles: chapter.chat_bubbles || [],  // Ensure this matches your schema field name
          conclusion: chapter.conclusion || "No conclusion provided",
          image_context: chapter.image_context || "No image context provided",
          narration_box: chapter.narration_box || "No narration provided",
          image_url: chapter.image_url || ""
        };
      });

      // Prepare the request payload with validated chapters
      const payload = {
        title: comicData.comic_topic || "Untitled Comic",
        email: userEmail,
        chapters: validatedChapters
      };

      console.log("Sending payload:", payload);

      // Make the API request
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/chapter/add-comicblogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save comic blog');
      }

      // Success handling
      alert("Comic blog saved successfully!");
      console.log("Comic blog saved:", responseData.comicBlog);

      // Store the saved blog ID for future reference
      localStorage.setItem("savedComicBlogId", responseData.comicBlog._id);

    } catch (error) {
      console.error("Error saving comic blog:", error);
      setError(`Failed to save comic: ${error.message}`);
      alert(`Error saving comic blog: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const comicStyles = ["Marvel", "DC", "Manga", "Indie"]
  const styleImages = {
    Marvel: "/images/sidebar/marvel.jpg",
    DC: "/images/sidebar/dc.jpeg",
    Manga: "/images/sidebar/manga.webp",
    Indie: "/images/sidebar/indie.jpeg",
  }

  // Effect for loading data from localStorage on component mount
  useEffect(() => {
    console.log("useEffect: Running effect hook to load data.");
    try {
      // --- Enhanced Comic Data Loading ---
      const storedComic = localStorage.getItem("comic");
      if (storedComic) {
        console.log("useEffect: Found 'comic' item in localStorage.");
        let parsedComic;
        try {
          parsedComic = JSON.parse(storedComic);
          console.log("useEffect: Successfully parsed comic JSON:", parsedComic);

          // --- *** THE FIX IS HERE *** ---
          // Check for chapters array AND title (since comic_topic wasn't present)
          const hasChapters = Array.isArray(parsedComic?.chapters);
          const hasTitle = !!parsedComic?.title; // Use title field for validation
          console.log(`useEffect: Checking parsed data - chapters is array: ${hasChapters}, title exists: ${hasTitle}`);

          // Use the modified check here
          if (parsedComic && hasChapters && hasTitle) {
            setComicData(parsedComic);
            console.log("useEffect: Comic data successfully loaded and set to state.");

            // NEW CODE: Check if comicData has video_url and store it
            if (parsedComic.video_url) {
              console.log("useEffect: Found video_url in comic data, storing in localStorage");

              // Create a video data object similar to what generateVideo would return
              const extractedVideoData = {
                videoUrl: parsedComic.video_url, // Map video_url to videoUrl for consistency
                filename: parsedComic.videoFilename || "comic_video.mp4",
                timestamp: Date.now(),
                title: parsedComic.title || parsedComic.comic_topic || "Comic Video",
                success: true
              };

              // Store in localStorage
              localStorage.setItem("generatedVideo", JSON.stringify(extractedVideoData));

              // Update videoData state
              setVideoData(extractedVideoData);
              console.log("useEffect: Set video data from comic data:", extractedVideoData);
            }
          } else {
            console.warn("useEffect: Parsed comic data structure is invalid or missing required fields (chapters array, title). State not set.");
            // Optionally clear invalid data from storage if needed
            // localStorage.removeItem("comic");
          }
        } catch (parseError) {
          console.error("useEffect: Error parsing 'comic' JSON from localStorage:", parseError);
          setError("Failed to parse comic data from storage."); // Use external error setter
        }
      } else {
        console.log("useEffect: No 'comic' item found in localStorage.");
      }

      // --- Video Data Loading ---
      const storedVideoData = localStorage.getItem("generatedVideo");
      if (storedVideoData) {
        console.log("useEffect: Found 'generatedVideo' item in localStorage.");
        try {
          const parsedVideoData = JSON.parse(storedVideoData);
          if (parsedVideoData && parsedVideoData.videoUrl) {
            setVideoData(parsedVideoData);
            console.log("useEffect: Video data loaded from localStorage:", parsedVideoData);
          } else {
            console.warn("useEffect: Parsed video data is invalid or missing videoUrl. Clearing potentially stale data.");
            localStorage.removeItem("generatedVideo"); // Optional: remove invalid stored data
            setVideoData(null);
          }
        } catch (parseError) {
          console.error("useEffect: Error parsing 'generatedVideo' JSON from localStorage:", parseError);
        }
      } else {
        console.log("useEffect: No 'generatedVideo' item found in localStorage.");
        // Ensure videoData is null if nothing is found and it wasn't already null
        if (videoData !== null) {
          setVideoData(null);
          console.log("useEffect: Cleared potentially stale videoData state as nothing found in localStorage.");
        }
      }
    } catch (error) {
      console.error("useEffect: Unexpected error loading data from localStorage:", error);
      setError("An unexpected error occurred while loading data."); // Use external error setter
    }
  }, []); // Empty dependency array: runs once on mount

  // Effect for logging state changes (useful for debugging)
  useEffect(() => {
    console.log("State Update: comicData is now:", comicData);
    console.log("State Update: videoData is now:", videoData);
    console.log("State Update: isProcessingReel is now:", isProcessingReel);
    // Check if button should be enabled/disabled based on current state
    if (!isProcessingReel && comicData) {
      console.log("Button condition: Should be ENABLED.");
    } else {
      console.log(`Button condition: Should be DISABLED (isProcessing: ${isProcessingReel}, hasComicData: ${!!comicData}).`);
    }
  }, [comicData, videoData, isProcessingReel]);

  // Effect to clean up video data when component unmounts
  useEffect(() => {
    // Return a cleanup function that will run when the component unmounts
    return () => {
      console.log("Component unmounting: Cleaning up video data from localStorage");
      localStorage.removeItem("generatedVideo");

      // If you're storing any blob URLs, revoke them to free memory
      if (videoData && videoData.videoUrl && videoData.videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoData.videoUrl);
      }
    };
  }, []); // Empty dependency array means this cleanup runs only when component unmounts

  // Function to handle the "Generate Reel" button click
  const handlePostAsReel = async () => {
    console.log("handlePostAsReel: Clicked!");

    // --- Check 1: comicData available? (Should pass if button wasn't disabled) ---
    if (!comicData) {
      console.error("handlePostAsReel: Aborting - comicData state is null or undefined. Button should have been disabled.");
      setReelError("Cannot generate reel: Comic data is not loaded correctly.");
      alert("Cannot generate reel: Comic data is not loaded correctly. Check console for details.");
      return;
    }
    console.log("handlePostAsReel: comicData check passed.");

    // --- Check 2: Already processing? ---
    if (isProcessingReel) {
      console.warn("handlePostAsReel: Aborting - Reel generation already in progress.");
      return;
    }

    // --- Start Processing ---
    console.log("handlePostAsReel: Setting processing state to true.");
    setIsProcessingReel(true);
    setReelError(null); // Clear previous errors
    setLoading(true);   // External loading state
    setError(null);     // External error state

    try {
      // --- Data Sanitization for Narration API ---
      const sanitizedComic = JSON.parse(JSON.stringify(comicData));
      if (!Array.isArray(sanitizedComic.chapters)) { // Defensive check
        throw new Error("Sanitized comic data does not have a chapters array.");
      }
      // Remove image_url before sending to narration API
      sanitizedComic.chapters = sanitizedComic.chapters.map((ch) => {
        const { image_url, ...rest } = ch;
        return rest;
      });
      console.log("handlePostAsReel: Sanitized comic data for narration API:", sanitizedComic);

      // --- API Call 1: Generate Narration ---
      console.log("handlePostAsReel: Calling generateShortNarration API...");
      const comicScriptString = JSON.stringify(sanitizedComic);
      const narrationResult = await generateShortNarration(comicScriptString);
      console.log("handlePostAsReel: Narration API returned:", narrationResult); // Log raw result

      // Basic validation of narration result
      if (typeof narrationResult !== 'string') {
        const resultInfo = typeof narrationResult === 'object' ? JSON.stringify(narrationResult) : String(narrationResult);
        throw new Error(`Narration generation failed or returned unexpected type: ${typeof narrationResult}. Result: ${resultInfo}`);
      }

      // --- Process Narration & Extract Image URLs ---
      // Use original comicData for image URLs
      if (!Array.isArray(comicData.chapters)) {
        throw new Error("Original comic data does not have a chapters array for image URL extraction.");
      }
      const imageUrls = comicData.chapters.map((ch) => ch.image_url).filter((url) => !!url);
      console.log("handlePostAsReel: Extracted Image URLs:", imageUrls);

      // Process narration string into lines
      const narrationLines = (narrationResult || "") // Handle potential null/undefined result
        .split("\n")
        .map((line) => line.trim().replace(/^- /, "").trim()) // Remove leading "- " and trim
        .filter((line) => line.length > 0);
      console.log("handlePostAsReel: Processed Narration Lines:", narrationLines);

      // --- Validation: Need Lines and Images ---
      if (narrationLines.length === 0) {
        console.error("handlePostAsReel: Failed to extract any narration lines from API result:", narrationResult);
        throw new Error("Could not extract narration lines for the video. Check narration API response in console.");
      }
      if (imageUrls.length === 0) {
        console.error("handlePostAsReel: Failed to extract any image URLs from comic data chapters:", comicData.chapters);
        throw new Error("Could not find any image URLs in the comic data chapters. Check data structure in console.");
      }
      console.log("handlePostAsReel: Narration lines and Image URLs seem present.");


      // --- API Call 2: Generate Video (Handle Mismatch) ---
      let videoInputTexts;
      if (narrationLines.length !== imageUrls.length) {
        console.warn(
          `handlePostAsReel: Narration lines (${narrationLines.length}) count does not match image URLs (${imageUrls.length}) count. Using chapter narration_box/conclusion/title text instead.`,
        );
        // Generate fallback text using optional chaining for safety
        const fallbackTexts = (comicData.chapters || []).map(
          (ch) => ch?.narration_box || ch?.conclusion || ch?.chapter_title || "...", // Fallback order
        );
        console.log("handlePostAsReel: Generated Fallback Texts:", fallbackTexts);

        // Validate fallback text count against image count
        if (fallbackTexts.length !== imageUrls.length) {
          console.error(`Fallback text count (${fallbackTexts.length}) still does not match image URLs (${imageUrls.length}). Raw Chapters:`, comicData.chapters);
          throw new Error(
            `Fallback text count (${fallbackTexts.length}) still does not match image URLs (${imageUrls.length}). Cannot generate video. Check console for chapter data.`,
          );
        }
        videoInputTexts = fallbackTexts;
      } else {
        console.log("handlePostAsReel: Narration lines count matches image URLs count.");
        videoInputTexts = narrationLines;
      }

      // Call the video generation API
      console.log("handlePostAsReel: Calling generateVideo API with texts:", videoInputTexts, "and image URLs:", imageUrls);
      const result = await generateVideo(videoInputTexts, imageUrls);
      console.log("handlePostAsReel: generateVideo API returned:", result);

      // --- Process Result ---
      if (result && result.videoUrl) {
        console.log("handlePostAsReel: Video generation successful! Video URL:", result.videoUrl);
        // Store video data in state and localStorage
        setVideoData(result);
        localStorage.setItem("generatedVideo", JSON.stringify(result));

        // Trigger view change if prop is provided
        if (onViewChange) {
          console.log("handlePostAsReel: Calling onViewChange('reel').");
          onViewChange("reel");
        } else {
          console.warn("handlePostAsReel: onViewChange prop is missing, cannot switch view automatically.");
        }

        alert("Reel generation successful! Your reel is now ready to view.");
      } else {
        // Handle case where API succeeds but doesn't return expected URL
        console.error("handlePostAsReel: No video URL returned from the server. API Response:", result);
        throw new Error("No video URL returned from the server. Check console for API response details.");
      }
    } catch (error) {
      // Catch any error during the try block (API calls, processing, etc.)
      console.error("handlePostAsReel: Error during Reel generation process:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setReelError(`Reel Generation Failed: ${errorMessage}`);
      alert(`Reel Generation Failed: ${errorMessage}. Check console for more details.`);
      setError(`Reel Generation Failed: ${errorMessage}`); // Set external error state
    } finally {
      // This block always runs, whether try succeeded or failed
      console.log("handlePostAsReel: Setting processing state to false in finally block.");
      setIsProcessingReel(false);
      setLoading(false); // Reset external loading state
    }
  }

  // --- Conditional Rendering Logic ---

  // RENDER 1: Reel View (if reel generated and view is set to 'reel')
  if (currentView === "reel" && videoData && videoData.videoUrl) {
    return (
      <div className="w-full h-full flex flex-col gap-4">
        {/* Card for Reel Info and Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-red-600 mb-3 tracking-wide">Your Comic Reel</h2>
          <p className="text-gray-700 mb-4">
            Your comic has been transformed into an engaging video reel. You can watch it or return to the comic view.
          </p>
          <div className="flex flex-col gap-3">
            {/* Button to go back to Comic Reading view */}
            <button
              onClick={() => onViewChange ? onViewChange("comic") : console.warn("onViewChange missing")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition hover:shadow-xl cursor-pointer whitespace-nowrap flex items-center justify-center"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Read Comic
            </button>
            {/* Button to open/download the reel */}
            <button
              onClick={() => {
                window.open(videoData.videoUrl, "_blank")
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition hover:shadow-xl cursor-pointer whitespace-nowrap flex items-center justify-center"
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> {/* Consider changing icon if ArrowLeft isn't download */}
              Download/View Reel
            </button>
          </div>
        </div>

        {/* Card for Sharing Options */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-red-600 mb-4">Share Your Reel</h3>
          <div className="flex gap-3">
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(videoData.videoUrl)}&text=Check out my AI-generated comic reel!`, "_blank")}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition"
            >
              Twitter
            </button>
            <button
              onClick={() => alert("YouTube sharing feature coming soon!")}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition"
            >
              YouTube
            </button>
            <button
              onClick={() => alert("Instagram sharing feature coming soon!")}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition"
            >
              Instagram
            </button>
          </div>
        </div>
      </div>
    )
  }

  // RENDER 2: Default Comic View
  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Card for Current Style and Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-red-600 mb-3 tracking-wide">Current Comic Style</h2>
        {/* Display current style */}
        <div className="relative mb-4">
          <div className="border-4 border-blue-600 bg-yellow-50 p-4 rounded-lg relative overflow-hidden">
            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12">
              FEATURED
            </div>
            <img
              src={styleImages[currentStyle] || "/placeholder.svg"}
              alt={`${currentStyle} Comic Style`}
              className="w-full h-44 object-cover object-top rounded mb-3" // Adjusted object-position
            />
            <h3 className="text-xl font-bold text-center text-blue-800">{currentStyle} Style</h3>
          </div>
        </div>

        {/* Button to change style (functionality not implemented in this code) */}
        <div className="mb-4">
          <div className="relative">
            <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 cursor-pointer whitespace-nowrap flex items-center justify-center">
              <Palette className="mr-2 h-5 w-5" />
              Generate Using Other Comic Style {/* Add onClick handler if needed */}
            </button>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full transform rotate-12 text-red-800">
              POW!
            </div>
          </div>
        </div>

        {/* Action Buttons: Post Blog / Generate Reel / View Reel */}
        <div className="flex gap-4">
          {/* Post Blog Button (functionality not implemented) */}
          <button
            onClick={handlePostSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition hover:shadow-xl cursor-pointer whitespace-nowrap flex items-center justify-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Post Blog {/* Add onClick handler if needed */}
          </button>

          {/* Conditional Button: View Reel or Generate Reel */}
          {(videoData && videoData.videoUrl) || (comicData && comicData.video_url) ? (
            // If video data exists in either videoData state or comicData, show "View Reel" button
            <button
              onClick={() => {
                // If videoData doesn't exist but comicData has video_url, create and set videoData first
                if (!videoData && comicData && comicData.video_url) {
                  const extractedVideoData = {
                    videoUrl: comicData.video_url,
                    filename: comicData.videoFilename || "comic_video.mp4",
                    timestamp: Date.now(),
                    title: comicData.title || comicData.comic_topic || "Comic Video",
                    success: true
                  };

                  // Store in localStorage
                  localStorage.setItem("generatedVideo", JSON.stringify(extractedVideoData));

                  // Update videoData state before changing view
                  setVideoData(extractedVideoData);
                  console.log("Created videoData from comicData.video_url:", extractedVideoData);
                }

                // Then change view
                onViewChange ? onViewChange("reel") : console.warn("onViewChange missing");
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition hover:shadow-xl cursor-pointer whitespace-nowrap flex items-center justify-center"
            >
              <Video className="mr-2 h-5 w-3" />
              View Reel
            </button>
          ) : (
            // Otherwise, show "Generate Reel" button
            <button
              onClick={handlePostAsReel}
              disabled={isProcessingReel || !comicData}
              className={`flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition hover:shadow-xl cursor-pointer whitespace-nowrap flex items-center justify-center ${isProcessingReel || !comicData ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isProcessingReel ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-5 w-3" />
                  Generate Reel
                </>
              )}
            </button>
          )}
        </div>
        {/* Display error message if reel generation failed */}
        {reelError && <p className="text-red-500 text-sm mt-2">{reelError}</p>}
      </div>

      {/* Card for Selecting Available Comic Styles */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-red-600 mb-4">Available Comic Styles</h3>
        <div className="grid grid-cols-2 gap-3 text-red-600">
          {comicStyles.map((style) => (
            <div
              key={style}
              // Allow changing style only if not currently processing a reel
              onClick={() => {
                if (!isProcessingReel) {
                  setCurrentStyle(style);
                  // Add this line to communicate with the parent component
                  if (window.parent && typeof window.parent.postMessage === 'function') {
                    window.parent.postMessage({ type: 'STYLE_CHANGE', style: style.toLowerCase() }, '*');
                  }
                }
              }}
              // Apply different styling based on current selection and processing state
              className={`border-2 p-2 rounded-lg cursor-pointer transition-all ${currentStyle === style ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-blue-400"
                } ${isProcessingReel ? "opacity-50 cursor-not-allowed" : ""}`} // Dim if processing
            >
              <p className="text-center font-bold">{style}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeftSidebar;

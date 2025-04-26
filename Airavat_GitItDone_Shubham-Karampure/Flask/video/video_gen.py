import os
import requests
import subprocess
import tempfile
import time
import gc
import numpy as np
import cv2
import json
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import ImageClip, concatenate_videoclips, AudioFileClip, VideoFileClip
from dotenv import load_dotenv
import platform
from pathlib import Path
load_dotenv()

# Add Whisper import
import whisper

def get_narration(text):
    """
    Obtain narration audio for the given text using Eleven Labs API.
    """
    # Check both possible environment variable names
    api_key = os.environ.get("ELEVEN_LAB_API_KEY") or os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        raise Exception("Please set the ELEVEN_LAB_API_KEY environment variable.")
    
    voice_id = "21m00Tcm4TlvDq8ikWAM"  # Your Eleven Labs voice ID
    
    # Note the updated URL format with voice_id in the path
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1"  # Adding the model ID which is often required
    }
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Error from Eleven Labs API: {response.text}")

    temp_audio_file = f"temp_{abs(hash(text))}.mp3"
    with open(temp_audio_file, "wb") as f:
        f.write(response.content)
        
    return temp_audio_file

def download_image(image_url):
    """
    Download an image from a URL and save it as a temporary file.
    """
    response = requests.get(image_url)
    if response.status_code != 200:
        raise Exception(f"Failed to download image from {image_url}")
    
    # Create a temporary file for the image
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    temp_file.write(response.content)
    temp_file.close()
    
    return temp_file.name

# Load Whisper model once to avoid reloading
_whisper_model = None

def get_whisper_model(model_size="base"):
    """
    Get or initialize Whisper model with specified size
    """
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model(model_size)
    return _whisper_model

def get_word_timestamps_with_whisper(audio_file, text=None):
    """
    Get precise word-level timestamps using Whisper
    
    Args:
        audio_file: Path to the audio file
        text: Optional reference text to improve alignment
    
    Returns:
        List of words with their start and end timestamps
    """
    try:
        # Load Whisper model
        model = get_whisper_model()
        
        # Transcribe with word timestamps
        result = model.transcribe(
            audio_file, 
            word_timestamps=True,
            language="en"
        )
        
        words_with_timestamps = []
        
        # Extract words and timestamps
        for segment in result["segments"]:
            for word_info in segment["words"]:
                words_with_timestamps.append({
                    "word": word_info["word"].strip(),
                    "start": word_info["start"],
                    "end": word_info["end"]
                })
        
        return words_with_timestamps
    
    except Exception as e:
        print(f"Error getting word timestamps with Whisper: {e}")
        # Fall back to estimated timestamps
        return create_estimated_word_timestamps(text, get_audio_duration(audio_file))

def get_audio_duration(audio_file):
    """Get the duration of an audio file using moviepy"""
    try:
        audio = AudioFileClip(audio_file)
        duration = audio.duration
        audio.close()
        return duration
    except Exception as e:
        print(f"Error getting audio duration: {e}")
        return 5.0  # Fallback default duration

def create_estimated_word_timestamps(text, duration):
    """Create estimated word timestamps as fallback when Whisper fails"""
    words = text.split()
    word_count = len(words)
    
    if word_count == 0:
        return []
    
    # Estimate time per word (simple approach)
    time_per_word = duration / word_count
    current_time = 0
    words_with_timestamps = []
    
    for word in words:
        word_duration = time_per_word * (len(word) / 4 + 0.5)  # Adjust duration by word length
        word_duration = min(word_duration, time_per_word * 2)  # Cap maximum duration
        
        words_with_timestamps.append({
            "word": word,
            "start": current_time,
            "end": current_time + word_duration
        })
        
        current_time += word_duration
    
    return words_with_timestamps

def create_srt_file(texts, durations, output_srt="subtitles.srt"):
    """
    Create an SRT subtitle file from a list of texts and their durations.
    """
    with open(output_srt, "w", encoding="utf-8") as f:
        start_time = 0
        for i, (text, duration) in enumerate(zip(texts, durations)):
            end_time = start_time + duration
            
            # Format time as HH:MM:SS,mmm
            start_str = format_srt_time(start_time)
            end_str = format_srt_time(end_time)
            
            # Write SRT entry
            f.write(f"{i+1}\n")
            f.write(f"{start_str} --> {end_str}\n")
            f.write(f"{text}\n\n")
            
            start_time = end_time
    
    return output_srt

def format_srt_time(seconds):
    """Format time in seconds to SRT time format HH:MM:SS,mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds_remainder = seconds % 60
    milliseconds = int((seconds_remainder - int(seconds_remainder)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{int(seconds_remainder):02d},{milliseconds:03d}"

# Caption.ai style subtitle functions
def get_system_fonts():
    """Get available system fonts based on OS"""
    system = platform.system()
    font_paths = []
    
    if system == "Windows":
        font_dir = Path("C:/Windows/Fonts")
        font_paths = [font_dir / "Arial.ttf", font_dir / "arialbd.ttf"]
    elif system == "Darwin":  # macOS
        font_paths = [
            Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
            Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
        ]
    else:  # Linux
        font_paths = [
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
        ]
    
    return font_paths

def load_font(size, bold=True):
    """Load system font with fallback"""
    font_paths = get_system_fonts()
    
    if bold:
        font_paths = [p for p in font_paths if "bold" in p.name.lower() or "bd" in p.name.lower()] + [p for p in font_paths if "bold" not in p.name.lower() and "bd" not in p.name.lower()]
    
    for font_path in font_paths:
        try:
            if font_path.exists():
                return ImageFont.truetype(str(font_path), size)
        except (IOError, OSError):
            continue
    
    return ImageFont.load_default()

def get_text_dimensions(text, font):
    """Get text dimensions with fallback"""
    text = text.strip()
    if font is None:
        return len(text) * 8, 16
    
    try:
        if hasattr(font, "getbbox"):
            bbox = font.getbbox(text)
            return bbox[2] - bbox[0], bbox[3] - bbox[1]
        elif hasattr(font, "getsize"):
            return font.getsize(text)
        else:
            return len(text) * (font.size // 2), font.size
    except:
        return len(text) * 8, 16

def create_words_with_timestamps(texts, durations):
    """Create word-level timestamps from text segments and their durations"""
    words_with_timestamps = []
    current_time = 0
    
    for text, duration in zip(texts, durations):
        words = text.split()
        word_count = len(words)
        
        if word_count == 0:
            continue
        
        # Estimate time per word (simple approach)
        time_per_word = duration / word_count
        
        for word in words:
            word_duration = time_per_word * (len(word) / 4 + 0.5)  # Adjust duration by word length
            word_duration = min(word_duration, time_per_word * 2)  # Cap maximum duration
            
            words_with_timestamps.append({
                "word": word,
                "start": current_time,
                "end": current_time + word_duration
            })
            
            current_time += word_duration
    
    return words_with_timestamps

def create_captionsai_style_frame(frame, words_to_display, current_word_idx, frame_width, frame_height, font=None, color_scheme=None):
    """Create a frame with captions.ai style subtitles"""
    try:
        # Convert BGR to RGB for PIL
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_frame = Image.fromarray(frame_rgb)
        
        # Create transparent overlay
        overlay = Image.new('RGBA', pil_frame.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Use provided color scheme or default
        if color_scheme is None:
            text_color = (255, 255, 255, 255)
            highlight_color = (255, 230, 0, 255)
            shadow_color = (0, 0, 0, 100)  # Reduced shadow alpha to 100
        else:
            text_color = (*color_scheme["text"], 255)
            highlight_color = (*color_scheme["highlight"], 255)
            shadow_color = (*color_scheme["shadow"], 100)  # Reduced shadow alpha to 100
        
        # Combine words into one string
        full_text = " ".join([word["word"] for word in words_to_display])
        
        # Calculate text wrapping
        max_width = int(frame_width * 0.8)
        wrapped_lines = []
        
        # Calculate average character width
        avg_char_width, _ = get_text_dimensions("x", font)
        
        # Simple word wrapping
        words = full_text.split()
        current_line = []
        current_width = 0
        
        # Define extra space between words - increased for better spacing
        extra_word_spacing = 8  # Increased from 4 to 8
        
        for word in words:
            # Calculate width of word with extra spacing
            word_only_width, _ = get_text_dimensions(word, font)
            
            if current_width + word_only_width + (extra_word_spacing if current_line else 0) <= max_width:
                current_line.append(word)
                current_width += word_only_width + (extra_word_spacing if len(current_line) > 1 else 0)
            else:
                wrapped_lines.append((current_line, current_width))
                current_line = [word]
                current_width = word_only_width
        
        if current_line:
            wrapped_lines.append((current_line, current_width))
        
        # Calculate text block height
        _, line_height = get_text_dimensions("Ay", font)
        text_block_height = len(wrapped_lines) * line_height * 1.5  # Increased line spacing factor from 1.2 to 1.5
        
        # Position text block
        bottom_padding = int(frame_height * 0.1)
        y_position = frame_height - bottom_padding - text_block_height
        
        # Track current word position
        global_word_idx = 0
        
        # Draw each line
        for line_idx, (line_words, line_width) in enumerate(wrapped_lines):
            # Center the line
            x_position = (frame_width - line_width) // 2
            line_y = y_position + line_idx * line_height * 1.5  # Use same spacing factor as above
            
            # Draw each word with its own shadow
            current_x_word_start = x_position
            for i, word in enumerate(line_words):
                word_width, _ = get_text_dimensions(word, font)
                
                # Determine if this is the current word
                is_current = (global_word_idx == current_word_idx)
                
                # Choose color based on whether this is the current word
                color = highlight_color if is_current else text_color
                
                # Add highlight effect for current word
                if is_current:
                    glow_padding = 4  # Slightly increased padding
                    word_box = [
                        current_x_word_start - glow_padding,
                        line_y - glow_padding,
                        current_x_word_start + word_width + glow_padding,
                        line_y + line_height + glow_padding
                    ]
                    
                    try:
                        draw.rounded_rectangle(
                            word_box,
                            radius=8,
                            fill=(highlight_color[0], highlight_color[1], highlight_color[2], 60)
                        )
                    except AttributeError:
                        draw.rectangle(
                            word_box,
                            fill=(highlight_color[0], highlight_color[1], highlight_color[2], 60)
                        )
                
                # Draw single shadow for each word (only one shadow position)
                shadow_offset = 1
                draw.text(
                    (current_x_word_start + shadow_offset, line_y + shadow_offset),
                    word,
                    font=font,
                    fill=shadow_color
                )
                
                # Draw the word
                draw.text((current_x_word_start, line_y), word, font=font, fill=color)
                
                # Move to next word position
                current_x_word_start += word_width + extra_word_spacing
                global_word_idx += 1
        
        # Composite overlay with original frame
        frame_with_overlay = Image.alpha_composite(pil_frame.convert('RGBA'), overlay)
        result = np.array(frame_with_overlay.convert('RGB'))
        
        # Convert back to BGR for OpenCV
        return cv2.cvtColor(result, cv2.COLOR_RGB2BGR)
    
    except Exception as e:
        print(f"Error creating captioned frame: {e}")
        return frame

def add_dynamic_subtitles(video_path, words_with_timestamps, output_path):
    """Add captions.ai style dynamic subtitles to video"""
    try:
        # Open video
        video = cv2.VideoCapture(video_path)
        if not video.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")
            
        fps = video.get(cv2.CAP_PROP_FPS)
        frame_width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Create output video writer - use temp file name
        temp_output = output_path + ".temp.mp4"
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        output_video = cv2.VideoWriter(
            temp_output, 
            fourcc, 
            fps, 
            (frame_width, frame_height)
        )
        
        if not output_video.isOpened():
            raise ValueError(f"Could not create output video file: {temp_output}")
        
        # Set up font and color scheme
        font_size = int(frame_height * 0.05)
        font = load_font(font_size, bold=True)
        color_scheme = {"text": (255, 255, 255), "highlight": (255, 230, 0), "shadow": (0, 0, 0)}
        
        # Process frames
        frame_idx = 0
        while True:
            ret, frame = video.read()
            if not ret:
                break
            
            # Calculate current time based on frame index
            current_time = frame_idx / fps
            
            # Find the current word based on timestamp
            current_word_idx = None
            for idx, word in enumerate(words_with_timestamps):
                if word["start"] <= current_time <= word["end"]:
                    current_word_idx = idx
                    break
            
            # If we have a current word, add subtitles
            if current_word_idx is not None:
                # Determine the window of words to display
                window_size = 8  # Show 8 words at a time
                window_start = max(0, current_word_idx - window_size // 2)
                window_end = min(len(words_with_timestamps), window_start + window_size)
                words_to_display = words_with_timestamps[window_start:window_end]
                
                # Adjust current_word_idx to be relative to the window
                relative_current_idx = current_word_idx - window_start
                
                frame = create_captionsai_style_frame(
                    frame, 
                    words_to_display, 
                    relative_current_idx, 
                    frame_width, 
                    frame_height,
                    font=font,
                    color_scheme=color_scheme
                )
            
            output_video.write(frame)
            frame_idx += 1
        
        # Release resources
        video.release()
        output_video.release()
        
        # Now add back the audio using moviepy
        silent_video = VideoFileClip(temp_output)
        original_video = VideoFileClip(video_path)
        final_video = silent_video.set_audio(original_video.audio)
        final_video.write_videofile(output_path, codec="libx264", audio_codec="aac")
        
        # Clean up
        silent_video.close()
        original_video.close()
        final_video.close()
        if os.path.exists(temp_output):
            os.remove(temp_output)
        
    except Exception as e:
        print(f"Error adding subtitles to video: {e}")
        raise

def generate_video(texts, image_urls, output_path=r"Flask\uploads\output.mp4", subtitle_style="modern"):
    """
    Generate a video that narrates given texts over corresponding images with modern subtitles.
    """
    clips = []
    durations = []
    temp_image_files = []
    all_words_with_timestamps = []
    segment_start_times = [0.0]  # Start times of each segment
    total_duration = 0.0
    
    # Download images from URLs
    for url in image_urls:
        temp_image_files.append(download_image(url))
    
    for text, image_file in zip(texts, temp_image_files):
        # Generate narration audio
        audio_file = get_narration(text)
        
        # Get word-level timestamps with Whisper (more accurate)
        segment_words = get_word_timestamps_with_whisper(audio_file, text)
        
        # Adjust timestamps for the current segment
        for word in segment_words:
            word["start"] += total_duration
            word["end"] += total_duration
        
        # Add to global list
        all_words_with_timestamps.extend(segment_words)
        
        # Create video clip
        audio_clip = AudioFileClip(audio_file)
        duration = audio_clip.duration
        durations.append(duration)
        
        # Update total duration and add new segment start time
        total_duration += duration
        segment_start_times.append(total_duration)
        
        image_clip = ImageClip(image_file).set_duration(duration).set_audio(audio_clip)
        clips.append(image_clip)
    
    # Create video without subtitles first
    temp_video = "temp_output_no_subs.mp4"
    final_video = concatenate_videoclips(clips, method="compose")
    final_video.write_videofile(temp_video, codec="libx264", fps=24, audio_codec="aac")
    
    # Add subtitles based on style
    if subtitle_style == "captions_ai":
        add_dynamic_subtitles(temp_video, all_words_with_timestamps, output_path)
    else:
        # Create SRT subtitle file using the improved timestamps
        srt_file = create_srt_file_from_words(all_words_with_timestamps, segment_start_times, texts)
        
        # Use FFmpeg to add subtitles
        subprocess.run([
            "ffmpeg",
            "-i", temp_video,
            "-vf", f"subtitles={srt_file}",
            "-c:a", "copy",
            output_path
        ], check=True)
        
        os.remove(srt_file)
    
    # Clean up
    if os.path.exists(temp_video):
        os.remove(temp_video)
    
    for file in temp_image_files:
        if os.path.exists(file):
            os.remove(file)
    
    for text in texts:
        temp_audio_file = f"temp_{abs(hash(text))}.mp3"
        if os.path.exists(temp_audio_file):
            os.remove(temp_audio_file)

def create_srt_file_from_words(words_with_timestamps, segment_start_times, original_texts, output_srt="subtitles.srt"):
    """
    Create an SRT subtitle file from word-level timestamps, grouped by segments.
    """
    with open(output_srt, "w", encoding="utf-8") as f:
        entry_num = 1
        
        # Process each segment
        for i in range(len(segment_start_times) - 1):
            segment_start = segment_start_times[i]
            segment_end = segment_start_times[i + 1]
            segment_text = original_texts[i]
            
            # Write SRT entry
            f.write(f"{entry_num}\n")
            f.write(f"{format_srt_time(segment_start)} --> {format_srt_time(segment_end)}\n")
            f.write(f"{segment_text}\n\n")
            
            entry_num += 1
    
    return output_srt

if __name__ == "__main__":
    # Example texts and corresponding image URLs
    texts = [
        "Welcome to our video presentation.",
        "Here we show how simple narration can be achieved."
    ]
    image_urls = [
        "https://www.lifewire.com/thmb/lWlCQDkZkvbWxKhkJZ6yjOJ_J4k=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ScreenShot2020-04-20at10.03.23AM-d55387c4422940be9a4f353182bd778c.jpg",
        "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D"
    ]
    # Choose subtitle_style="captions_ai" for Caption.ai style or "modern" for traditional SRT subtitles
    generate_video(texts, image_urls, subtitle_style="captions_ai")
# Comicpedia 🧠🎨

**Comicpedia** is an AI-powered tool that transforms Wikipedia articles into interactive comic strips, making education more visual, engaging, and fun. It caters to diverse learning styles by simplifying complex topics without compromising depth.

## 🚀 Features

- **AI Comic Generation & Interaction**: Transforms Wikipedia articles into comic narratives using **CrewAI**, **LangChain** (integrating **Google Gemini** via **Vertex AI**), **Wikipedia API**, and the **FLUX.1-schnell-Free** model for image generation.

- **Style & Complexity Control**: Allows users to choose between manga or western styles and adjust content depth based on age or preference.

- **Interactive Word Bot**: Hover over words to get instant meanings using **Google Gemini**—eliminating the need to switch apps or search elsewhere.

- **Comic-to-Reel in a Click**: Automatically generates audiovisual reels using **Whisper** for transcription, **Eleven Labs API** for text-to-speech, and tools like **MoviePy**, **OpenCV**, and **FFmpeg** for video/audio processing.

## 🛠️ Tech Stack

- **Frontend**: Next.js

- **Backend**: Node.js & Flask
  
- **AI & ML**: CrewAI, LangChain, Google Gemini, FLUX.1-schnell-Free

- **Media Processing**: Whisper, Eleven Labs API, MoviePy, OpenCV, FFmpeg

## 📚 Getting Started

### Prerequisites

- Node.js

- Python 3.x

- npm

- pip

### Installation

1. **Install frontend dependencies:**

   ```bash
   cd frontend
   npm install
   ```
   
2. **Install Node dependencies:**

   ```bash
   cd server
   npm install
   ```


3. **Install backend dependencies:**

   ```bash
   cd ../flask
   pip install -r requirements.txt
   ```


4. **Start the development servers:**

   - **Frontend:**

     ```bash
     cd frontend
     npm run dev
     ```

   - **Node:**

     ```bash
     cd backend
     nodemon server.js
     ```
   - **Flask:**

     ```bash
     cd flask
     python app.py
     ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

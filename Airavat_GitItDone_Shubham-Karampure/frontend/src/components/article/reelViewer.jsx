"use client"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

const ReelViewer = ({ comicData }) => {
  const [reelUrl, setReelUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoRef = useRef(null)

  useEffect(() => {
    const storedReelString = localStorage.getItem("generatedVideo");

  if (storedReelString) {
    const storedReel = JSON.parse(storedReelString);
    console.log(storedReel);
    setReelUrl(storedReel.videoUrl);
  }
    }, [])

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(currentProgress)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const seekPosition = e.nativeEvent.offsetX / e.target.clientWidth
    if (videoRef.current) {
      videoRef.current.currentTime = seekPosition * videoRef.current.duration
      setProgress(seekPosition * 100)
    }
  }

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  if (!reelUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">No Reel Available</h2>
          <p className="text-gray-700">
            You haven't generated a reel for this comic yet. Use the "Post as a Reel" button to create one.
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-xl overflow-hidden"
    >
      <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <h2 className="text-xl font-bold">
          {comicData?.comic_topic ? `${comicData.comic_topic} - Comic Reel` : "Comic Reel"}
        </h2>
      </div>

      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={reelUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div 
            className="h-2 bg-gray-700 rounded-full mb-3 cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-purple-600 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRestart}
                className="text-white hover:text-purple-300 transition"
              >
                <SkipBack size={20} />
              </button>
              
              <button
                onClick={handlePlayPause}
                className="bg-white text-purple-800 rounded-full p-2 hover:bg-purple-100 transition"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <button className="text-white hover:text-purple-300 transition">
                <SkipForward size={20} />
              </button>
              
              <div className="text-white text-sm">
                {videoRef.current ? formatTime(videoRef.current.currentTime) : "0:00"} / 
                {duration ? formatTime(duration) : "0:00"}
              </div>
            </div>
            
            <button
              onClick={handleMuteToggle}
              className="text-white hover:text-purple-300 transition"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-purple-800 mb-2">About This Reel</h3>
        <p className="text-gray-700">
          This reel was automatically generated from your comic "{comicData?.comic_topic || "Comic"}". 
          It features {comicData?.chapters?.length || 0} scenes with narration based on your comic's content.
        </p>
        
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-bold text-purple-700 mb-2">Chapters Featured</h4>
          <ul className="list-disc pl-5 space-y-1">
            {comicData?.chapters?.map((chapter, index) => (
              <li key={index} className="text-gray-700">
                {chapter.chapter_title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

export default ReelViewer

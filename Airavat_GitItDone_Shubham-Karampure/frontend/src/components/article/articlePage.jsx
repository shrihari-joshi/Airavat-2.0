"use client"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Info, X, BookOpen, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

import LeftSidebar from "./leftsidebar"
import ReelViewer from "./reelViewer"
import { generateImage } from "@/api/genApi"
import { fetchTermExplanation } from "@/lib/gemini"
import { comicThemes } from "./comic-themes"
// Helper component to make individual words hoverable
const HoverableText = ({ text, onMouseEnter, onMouseLeave, loadingTerm, termType }) => {
  // Split text into words while preserving punctuation
  const words = text.split(/(\s+)/).filter(Boolean)

  return (
    <>
      {words.map((word, index) => {
        // Skip rendering hover effect for whitespace
        if (/^\s+$/.test(word)) {
          return <span key={index}>{word}</span>
        }

        const termId = `${termType}_${index}`

        return (
          <span
            key={index}
            className={`hover:bg-yellow-100 transition-colors duration-200 ${loadingTerm === termId ? "bg-yellow-200" : ""
              }`}
            onMouseEnter={(e) => onMouseEnter(termId, word, e)}
            onMouseLeave={onMouseLeave}
          >
            {word}
            {loadingTerm === termId && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 animate-pulse"></span>
            )}
          </span>
        )
      })}
    </>
  )
}

const ArticlePage = () => {
  const [comicData, setComicData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingImages, setGeneratingImages] = useState(false)
  const [activePopup, setActivePopup] = useState(null)
  const [popupContent, setPopupContent] = useState("")
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [loadingTerm, setLoadingTerm] = useState(null)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [currentView, setCurrentView] = useState("comic") // "comic" or "reel"
  const [hasReel, setHasReel] = useState(false)
  const [comicStyle, setComicStyle] = useState("marvel") // Default style: "marvel", "dc", "manga", or "indie"
  const hoverTimerRef = useRef(null)
  const popupRef = useRef(null)

  // Get theme based on comic style
  const theme = comicThemes[comicStyle] || comicThemes.marvel

  useEffect(() => {
    // Try to get comic data from localStorage
    const fetchComicData = async () => {
      try {
        const storedComic = localStorage.getItem("comic")
        if (storedComic) {
          console.log("Stored comic data found:", storedComic)
          const parsedComic = JSON.parse(storedComic)
          console.log(parsedComic)
          setComicData(parsedComic)

          // Determine comic style based on metadata or comic_title if available
          if (parsedComic.style) {
            setComicStyle(parsedComic.style.toLowerCase())
          } else if (parsedComic.comic_title) {
            // Simple heuristic to guess style based on topic
            const topic = parsedComic.comic_title.toLowerCase()
            if (topic.includes("japan") || topic.includes("anime") || topic.includes("ninja")) {
              setComicStyle("manga")
            } else if (topic.includes("batman") || topic.includes("superman") || topic.includes("justice")) {
              setComicStyle("dc")
            } else if (topic.includes("indie") || topic.includes("alternative") || topic.includes("underground")) {
              setComicStyle("indie")
            } else if (topic.includes("marvel") || topic.includes("avengers") || topic.includes("spider")) {
              setComicStyle("marvel")
            }
          }

          // Check if we need to generate images
          const needsImageGeneration = parsedComic.chapters.some(
            (chapter) => chapter.image_context && !chapter.image_url,
          )

          if (needsImageGeneration) {
            await generateImagesForChapters(parsedComic)
          }
        }

        // Check if reel exists
        const reelUrl = localStorage.getItem("reelUrl")
        if (reelUrl) {
          setHasReel(true)
          // Optionally auto-switch to reel view
          // setCurrentView("reel")
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching comic data:", error)
        setLoading(false)
      }
    }

    fetchComicData()

    // Cleanup function for hover timer
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
    }
  }, [])

  // Listen for style change messages from the sidebar iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "STYLE_CHANGE") {
        setComicStyle(event.data.style)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  // Click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActivePopup(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const generateImagesForChapters = async (comic) => {
    try {
      setGeneratingImages(true)
      const updatedChapters = [...comic.chapters]
      let imagesGenerated = false

      // Generate images for each chapter that doesn't have one
      for (let i = 0; i < updatedChapters.length; i++) {
        const chapter = updatedChapters[i]
        if (chapter.image_context && !chapter.image_url) {
          console.log(`Generating image for chapter ${chapter.chapter_number}...`)
          const imageUrl = await generateImage(chapter.image_context)

          if (imageUrl) {
            updatedChapters[i] = {
              ...chapter,
              image_url: imageUrl,
            }
            imagesGenerated = true
          }
        }
      }

      if (imagesGenerated) {
        const updatedComic = {
          ...comic,
          chapters: updatedChapters,
        }
        setComicData(updatedComic)

        // Save updated comic with image URLs to localStorage
        localStorage.setItem("comic", JSON.stringify(updatedComic))
      }
    } catch (error) {
      console.error("Error generating images:", error)
    } finally {
      setGeneratingImages(false)
      setLoading(false)
    }
  }

  const handleMouseEnter = (termId, word, event) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }

    setLoadingTerm(termId)

    hoverTimerRef.current = setTimeout(async () => {
      try {
        const explanation = await fetchTermExplanation(word)

        const rect = event.target.getBoundingClientRect()
        const scrollTop = window.scrollY || document.documentElement.scrollTop

        setPopupContent(explanation)
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + scrollTop,
        })
        setActivePopup(word)
        setLoadingTerm(null)
      } catch (error) {
        console.error("Error fetching term explanation:", error)
        setLoadingTerm(null)
      }
    }, 3000)
  }

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      setLoadingTerm(null)
    }
  }

  const closePopup = () => {
    setActivePopup(null)
  }

  const navigateChapter = (direction) => {
    if (!comicData) return

    if (direction === "next" && currentChapterIndex < comicData.chapters.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1)
    } else if (direction === "prev" && currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1)
    }
  }

  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.loadingBackground} font-comic flex items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold flex flex-col items-center"
        >
          <div
            className={`w-16 h-16 border-4 ${theme.loadingSpinner} border-t-transparent rounded-full animate-spin mb-4`}
          ></div>
          Loading your comic...
        </motion.div>
      </div>
    )
  }

  if (!comicData) {
    return (
      <div className={`min-h-screen ${theme.pageBackground} font-comic flex items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold bg-white p-8 rounded-xl shadow-xl"
        >
          <div className="text-red-500 mb-2">No comic data found!</div>
          <p className="text-base text-gray-600">Please create a comic first.</p>
        </motion.div>
      </div>
    )
  }

  const currentChapter = comicData.chapters[currentChapterIndex]
  const totalChapters = comicData.chapters.length

  return (
    <div className={`min-h-screen ${theme.pageBackground} ${theme.fontFamily}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Using your existing component */}
          <div className="lg:w-1/4 w-full lg:sticky lg:top-4 lg:self-start bg-transparent">
            <LeftSidebar onViewChange={handleViewChange} currentView={currentView} />
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-3/4 w-full"
          >
            {/* Comic Header - Shown for both views */}
            <motion.div
              className="relative h-64 w-full rounded-t-xl overflow-hidden shadow-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`absolute inset-0 ${theme.headerGradient} z-10`}></div>
              <div className="relative w-full h-full">
                <Image
                  src={comicData.chapters[0].image_url || "/placeholder.svg"}
                  alt="Comic header background"
                  fill
                  sizes="(max-width: 768px) 100vw, 75vw"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  priority
                />
              </div>
              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 z-20">
                <motion.div
                  className={theme.titleTransform}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1
                    className={`text-3xl md:text-5xl font-extrabold ${theme.titleText} tracking-tight mb-2 drop-shadow-lg`}
                  >
                    {theme.titlePrefix}{" "}
                    <span
                      className={`${theme.titleHighlight} relative ${loadingTerm === "comic_topic" ? "bg-yellow-200" : ""}`}
                      onMouseEnter={(e) => handleMouseEnter("comic_topic", comicData.comic_topic, e)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {comicData.comic_topic}
                      {loadingTerm === "comic_topic" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 animate-pulse"></span>
                      )}
                    </span>
                  </h1>

                </motion.div>
              </div>
            </motion.div>

            {/* View Toggle Navigation */}
            <div
              className={`${theme.navigationBar} p-4 flex justify-between items-center border-b-2 border-gray-200 sticky top-0 z-30 shadow-md`}
            >
              {currentView === "comic" ? (
                <>
                  <button
                    onClick={() => navigateChapter("prev")}
                    disabled={currentChapterIndex === 0}
                    className={`flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full ${currentChapterIndex === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : `${theme.navButtonText} ${theme.navButtonHover}`
                      } transition-all`}
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className={`${theme.chapterIndicator} font-medium text-sm md:text-base px-4 py-1 rounded-full`}>
                    {theme.chapterPrefix} {currentChapter.chapter_number} {theme.chapterOf} {totalChapters}
                  </div>

                  <button
                    onClick={() => navigateChapter("next")}
                    disabled={currentChapterIndex === totalChapters - 1}
                    className={`flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full ${currentChapterIndex === totalChapters - 1
                      ? "text-gray-400 cursor-not-allowed"
                      : `${theme.navButtonText} ${theme.navButtonHover}`
                      } transition-all`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1" />
                  </button>
                </>
              ) : (
                <div className="w-full flex justify-center">
                  <div className={`${theme.reelIndicator} font-medium text-base px-4 py-1 rounded-full`}>
                    Viewing Comic Reel
                  </div>
                </div>
              )}
            </div>

            {/* Conditional Content Based on View */}
            <div className={`${theme.contentBackground} shadow-xl rounded-b-xl`}>
              <AnimatePresence mode="wait">
                {currentView === "comic" ? (
                  <motion.div
                    key="comic-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 md:p-8"
                  >
                    <motion.div
                      key={currentChapter.chapter_number}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* Chapter Panel */}
                      <motion.div
                        className={`${theme.chapterPanel} p-4 md:p-6 mb-8 relative rounded-lg`}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={`absolute -top-4 -left-4 ${theme.chapterBadge} text-white text-sm font-bold px-3 py-1 rounded-md shadow-lg`}
                        >
                          <span
                            className={`relative ${loadingTerm === "chapter" ? theme.chapterBadgeHighlight : ""}`}
                            onMouseEnter={(e) =>
                              handleMouseEnter("chapter", `Chapter ${currentChapter.chapter_number}`, e)
                            }
                            onMouseLeave={handleMouseLeave}
                          >
                            {theme.chapterLabel} {currentChapter.chapter_number}
                            {loadingTerm === "chapter" && (
                              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white animate-pulse"></span>
                            )}
                          </span>
                        </div>
                        <h2
                          className={`text-xl md:text-2xl font-bold mb-4 ${theme.chapterTitle} border-b-2 ${theme.chapterTitleBorder} pb-2`}
                        >
                          {currentChapter.chapter_title}
                        </h2>

                        {/* Content layout based on comic style */}
                        <div className={theme.contentLayout}>
                          {/* Content Section */}
                          <div className={theme.textContentClass}>
                            {/* Narration Box */}
                            {currentChapter.narration_box && (
                              <motion.div
                                className={`${theme.narrationBox} p-4 mb-6 text-black italic rounded-lg shadow-md`}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                              >
                                <div className="flex items-center mb-2 ">
                                  <div className={`${theme.narrationAccent} h-6 w-1 mr-2 rounded-full`}></div>
                                  <h3 className={theme.narrationTitle}>Narration</h3>
                                </div>
                                <HoverableText
                                  text={currentChapter.narration_box}
                                  onMouseEnter={handleMouseEnter}
                                  onMouseLeave={handleMouseLeave}
                                  loadingTerm={loadingTerm}
                                  termType="narration"
                                />
                              </motion.div>
                            )}

                            {/* Chat Bubbles - Styled based on theme */}
                            {currentChapter.chat_bubbles &&
                              currentChapter.chat_bubbles.map((bubble, bubbleIndex) => {
                                // Alternate bubble styles for visual interest
                                const isEven = bubbleIndex % 2 === 0
                                return (
                                  <motion.div
                                    key={bubbleIndex}
                                    className={`relative mb-6 text-black ${isEven ? theme.bubbleEvenAlignment : theme.bubbleOddAlignment}`}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + bubbleIndex * 0.1, duration: 0.4 }}
                                  >
                                    <div
                                      className={`
                                        inline-block max-w-[85%] 
                                        p-4 rounded-[20px] relative shadow-md
                                        ${isEven ? theme.bubbleEvenStyle : theme.bubbleOddStyle}
                                      `}
                                    >
                                      <div
                                        className={`
                                          absolute w-4 h-4 transform 
                                          ${isEven ? theme.bubbleEvenTail : theme.bubbleOddTail}
                                        `}
                                      ></div>
                                      <p
                                        className={`font-bold mb-1 ${isEven ? theme.bubbleEvenCharacter : theme.bubbleOddCharacter} ${isEven ? "" : theme.bubbleOddTextAlign}`}
                                      >
                                        {bubble.character}:
                                      </p>
                                      <HoverableText
                                        text={bubble.dialogue}
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                        loadingTerm={loadingTerm}
                                        termType={`chat_${bubbleIndex}`}
                                      />
                                    </div>
                                    {/* Character avatar */}
                                    <div
                                      className={`
                                        w-10 h-10 rounded-full 
                                        absolute bottom-0 
                                        ${isEven ? "-left-6" : "-right-6"}
                                        flex items-center justify-center font-bold 
                                        shadow-md border-2
                                        ${isEven ? theme.avatarEvenStyle : theme.avatarOddStyle}
                                      `}
                                    >
                                      {bubble.character.charAt(0)}
                                    </div>
                                  </motion.div>
                                )
                              })}

                            {/* Conclusion */}
                            {currentChapter.conclusion && (
                              <motion.div
                                className={`${theme.conclusionBox} rounded-lg p-4 mb-4 relative shadow-md mt-8`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div
                                  className={`absolute -top-3 -right-3 ${theme.keyPointBadge} text-xs font-bold px-2 py-1 rounded-full transform rotate-12 shadow-md`}
                                >
                                  {theme.keyPointText}
                                </div>
                                <div className="flex items-center mb-2">
                                  <div className={`${theme.conclusionAccent} h-6 w-1 mr-2 rounded-full`}></div>
                                  <h3 className={theme.conclusionTitle}>Conclusion</h3>
                                </div>
                                <p className="text-gray-700">
                                  <HoverableText
                                    text={currentChapter.conclusion}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                    loadingTerm={loadingTerm}
                                    termType="conclusion"
                                  />
                                </p>
                              </motion.div>
                            )}
                          </div>

                          {/* Image Section - Positioned based on theme */}
                          <motion.div
                            className={theme.imageContainerClass}
                            initial={{ x: theme.imageAnimation.x, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                          >
                            <div className={`relative ${theme.imageAspectRatio} w-full`}>
                              {currentChapter.image_url ? (
                                <div
                                  className={`relative w-full h-full rounded-lg ${theme.imageBorder} shadow-lg overflow-hidden`}
                                >
                                  <Image
                                    src={currentChapter.image_url || "/placeholder.svg"}
                                    alt={`Chapter ${currentChapter.chapter_number} illustration`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    style={{ objectFit: "cover" }}
                                    className={`transition-transform duration-300 ${theme.imageHoverEffect}`}
                                    onMouseEnter={(e) => handleMouseEnter("image_context", "Comic illustration", e)}
                                    onMouseLeave={handleMouseLeave}
                                  />
                                  <div
                                    className={`absolute bottom-0 left-0 right-0 ${theme.imageCaption} p-3 text-white text-sm`}
                                  >
                                    {theme.imagePrefix} {currentChapter.chapter_number} {theme.imageSuffix}
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300 shadow-inner">
                                  <div className="animate-pulse flex flex-col items-center">
                                    <div
                                      className={`w-12 h-12 border-4 ${theme.loadingSpinner} border-t-purple-600 rounded-full animate-spin mb-4`}
                                    ></div>
                                    <p className="text-purple-600 font-medium">Generating image...</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Sources Section */}
                    <motion.div
                      className={`mt-12 border-t-4 ${theme.sourcesBorder} pt-6`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <h2 className={`text-xl md:text-2xl font-bold mb-4 ${theme.sourcesTitle} flex items-center`}>
                        <BookOpen className={`w-6 h-6 mr-2 ${theme.sourcesIcon}`} />
                        <span
                          className={`relative ${loadingTerm === "sources" ? theme.sourcesHighlight : ""}`}
                          onMouseEnter={(e) => handleMouseEnter("sources", "Sources & Further Reading", e)}
                          onMouseLeave={handleMouseLeave}
                        >
                          Sources & Further Reading
                          {loadingTerm === "sources" && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-400 animate-pulse"></span>
                          )}
                        </span>
                      </h2>
                      <motion.div
                        className={`${theme.sourcesBox} p-4 rounded-lg shadow-md`}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className={`mb-3 font-medium ${theme.sourcesText}`}>
                          Learn more about {comicData.comic_topic}:
                        </p>
                        <ul className="space-y-3">
                          <motion.li className="flex items-center" whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                            <BookOpen className={`w-5 h-5 ${theme.sourcesLinkIcon} mr-2 flex-shrink-0`} />
                            <a
                              href="#"
                              className={`${theme.sourcesLink} hover:underline font-medium flex items-center group`}
                            >
                              <span className="line-clamp-1">Wikipedia: {comicData.comic_topic}</span>
                              <ExternalLink className="w-4 h-4 ml-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </motion.li>
                          <motion.li className="flex items-center" whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                            <BookOpen className={`w-5 h-5 ${theme.sourcesLinkIcon} mr-2 flex-shrink-0`} />
                            <a
                              href="#"
                              className={`${theme.sourcesLink} hover:underline font-medium flex items-center group`}
                            >
                              <span className="line-clamp-1">National Geographic: {comicData.comic_topic}</span>
                              <ExternalLink className="w-4 h-4 ml-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </motion.li>
                          <motion.li className="flex items-center" whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                            <BookOpen className={`w-5 h-5 ${theme.sourcesLinkIcon} mr-2 flex-shrink-0`} />
                            <a
                              href="#"
                              className={`${theme.sourcesLink} hover:underline font-medium flex items-center group`}
                            >
                              <span className="line-clamp-1">Khan Academy: {comicData.comic_topic}</span>
                              <ExternalLink className="w-4 h-4 ml-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </motion.li>
                        </ul>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div key="reel-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ReelViewer comicData={comicData} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Term Explanation Popup */}
      <AnimatePresence>
        {activePopup && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: `${popupPosition.y - 80}px`,
              left: `${popupPosition.x - 150}px`,
              zIndex: 1000,
              width: "300px",
            }}
            className={`${theme.popupBackground} rounded-lg shadow-xl ${theme.popupBorder} p-4`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className={`flex items-center ${theme.popupTitle} font-bold`}>
                <Info className="w-4 h-4 mr-1" />
                Term: {activePopup}
              </div>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                aria-label="Close popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className={`${theme.popupText} text-sm`}>{popupContent}</p>
            <div
              className={`w-4 h-4 ${theme.popupBackground} ${theme.popupTail} transform rotate-45 absolute -bottom-2 left-1/2 -ml-2`}
            ></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator for term hover */}
      <AnimatePresence>
        {loadingTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed bottom-4 right-4 ${theme.loadingIndicator} text-white px-4 py-2 rounded-full shadow-lg flex items-center z-50`}
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading info about the word...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ArticlePage

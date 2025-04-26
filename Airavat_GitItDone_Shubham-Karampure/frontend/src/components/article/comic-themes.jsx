// Comic theme definitions for different comic styles
export const comicThemes = {
    // Marvel-inspired theme
    marvel: {
      // General
      fontFamily: "font-comic",
      pageBackground: "bg-gradient-to-br from-red-50 to-blue-50",
      contentBackground: "bg-white",
      loadingBackground: "bg-gradient-to-br from-red-50 to-blue-50",
      loadingSpinner: "border-red-600",
      loadingIndicator: "bg-gradient-to-r from-red-600 to-blue-600",
  
      // Header
      headerGradient: "bg-gradient-to-r from-red-900/80 to-blue-900/50",
      titleText: "text-white",
      titleHighlight: "text-yellow-400",
      subtitleText: "text-white/90",
      titleTransform: "transform -rotate-2",
      titlePrefix: "The Incredible Story of",
      comicTagline: "A thrilling journey exploring the world of language models!",
  
      // Navigation
      navigationBar: "bg-white",
      navButtonText: "text-red-600",
      navButtonHover: "hover:bg-red-100 hover:shadow-md",
      chapterIndicator: "bg-red-50 text-gray-700",
      chapterPrefix: "Chapter",
      chapterOf: "of",
      reelIndicator: "text-red-700 bg-red-50",
  
      // Chapter Panel
      chapterPanel: "border-4 border-black bg-gradient-to-br from-red-50 to-blue-100",
      chapterBadge: "bg-gradient-to-r from-red-600 to-blue-600",
      chapterBadgeHighlight: "bg-red-500",
      chapterLabel: "CHAPTER",
      chapterTitle: "text-red-900",
      chapterTitleBorder: "border-red-200",
  
      // Content Layout
      contentLayout: "flex flex-col lg:flex-row gap-6",
      textContentClass: "lg:w-1/2",
      imageContainerClass: "lg:w-1/2",
      imageAnimation: { x: 20 },
  
      // Narration
      narrationBox: "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-300",
      narrationAccent: "bg-indigo-600",
      narrationTitle: "text-indigo-800",
  
      // Chat Bubbles
      bubbleEvenAlignment: "ml-4",
      bubbleOddAlignment: "mr-4 text-right",
      bubbleEvenStyle: "rounded-bl-none text-left bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300",
      bubbleOddStyle: "rounded-br-none bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300",
      bubbleEvenTail: "rotate-45 -bottom-2 left-4 border-b-2 border-l-2 border-red-300 bg-red-50",
      bubbleOddTail: "rotate-45 -bottom-2 right-4 border-b-2 border-r-2 border-blue-300 bg-blue-50",
      bubbleEvenCharacter: "text-red-700",
      bubbleOddCharacter: "text-blue-700",
      bubbleOddTextAlign: "text-right",
      avatarEvenStyle: "bg-gradient-to-br from-red-400 to-red-600 text-white border-red-700",
      avatarOddStyle: "bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-700",
  
      // Conclusion
      conclusionBox: "bg-gradient-to-r from-red-100 to-blue-100 border-2 border-red-300",
      conclusionAccent: "bg-red-600",
      conclusionTitle: "text-red-800",
      keyPointBadge: "bg-gradient-to-r from-yellow-400 to-orange-400",
      keyPointText: "KEY POINT!",
  
      // Image
      imageAspectRatio: "aspect-[4/3]",
      imageBorder: "border-2 border-red-300",
      imageHoverEffect: "hover:scale-105",
      imageCaption: "bg-gradient-to-t from-black/70 to-transparent",
      imagePrefix: "Chapter",
      imageSuffix: "Illustration",
  
      // Sources
      sourcesBorder: "border-red-200",
      sourcesTitle: "text-red-900",
      sourcesIcon: "text-red-700",
      sourcesHighlight: "bg-orange-100",
      sourcesBox: "bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200",
      sourcesText: "text-red-800",
      sourcesLink: "text-red-600",
      sourcesLinkIcon: "text-red-600",
  
      // Popup
      popupBackground: "bg-white",
      popupBorder: "border-2 border-red-300",
      popupTitle: "text-red-700",
      popupText: "text-gray-700",
      popupTail: "border-b-2 border-r-2 border-red-300",
    },
  
    // DC-inspired theme
    dc: {
      // General
      fontFamily: "font-comic",
      pageBackground: "bg-gradient-to-br from-blue-50 to-gray-100",
      contentBackground: "bg-white",
      loadingBackground: "bg-gradient-to-br from-blue-50 to-gray-100",
      loadingSpinner: "border-blue-600",
      loadingIndicator: "bg-gradient-to-r from-blue-600 to-gray-700",
  
      // Header
      headerGradient: "bg-gradient-to-r from-blue-900/80 to-gray-900/70",
      titleText: "text-white",
      titleHighlight: "text-yellow-300",
      subtitleText: "text-white/90",
      titleTransform: "transform -rotate-0",
      titlePrefix: "The Dark Tale of",
      comicTagline: "Justice and knowledge in a world of shadows!",
  
      // Navigation
      navigationBar: "bg-gray-900",
      navButtonText: "text-blue-400",
      navButtonHover: "hover:bg-gray-800 hover:shadow-md",
      chapterIndicator: "bg-blue-900 text-white",
      chapterPrefix: "Issue",
      chapterOf: "of",
      reelIndicator: "text-white bg-blue-900",
  
      // Chapter Panel
      chapterPanel: "border-4 border-black bg-gradient-to-br from-blue-50 to-gray-100",
      chapterBadge: "bg-gradient-to-r from-blue-700 to-gray-800",
      chapterBadgeHighlight: "bg-blue-600",
      chapterLabel: "ISSUE",
      chapterTitle: "text-blue-900",
      chapterTitleBorder: "border-blue-200",
  
      // Content Layout
      contentLayout: "flex flex-col-reverse lg:flex-row gap-6",
      textContentClass: "lg:w-1/2",
      imageContainerClass: "lg:w-1/2 mb-6 lg:mb-0",
      imageAnimation: { x: -20 },
  
      // Narration
      narrationBox: "bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400",
      narrationAccent: "bg-gray-700",
      narrationTitle: "text-gray-800",
  
      // Chat Bubbles
      bubbleEvenAlignment: "ml-4",
      bubbleOddAlignment: "mr-4 text-right",
      bubbleEvenStyle: "rounded-bl-none text-left bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300",
      bubbleOddStyle: "rounded-br-none bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300",
      bubbleEvenTail: "rotate-45 -bottom-2 left-4 border-b-2 border-l-2 border-blue-300 bg-blue-50",
      bubbleOddTail: "rotate-45 -bottom-2 right-4 border-b-2 border-r-2 border-gray-300 bg-gray-50",
      bubbleEvenCharacter: "text-blue-700",
      bubbleOddCharacter: "text-gray-700",
      bubbleOddTextAlign: "text-right",
      avatarEvenStyle: "bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-800",
      avatarOddStyle: "bg-gradient-to-br from-gray-500 to-gray-700 text-white border-gray-800",
  
      // Conclusion
      conclusionBox: "bg-gradient-to-r from-blue-100 to-gray-100 border-2 border-blue-300",
      conclusionAccent: "bg-blue-700",
      conclusionTitle: "text-blue-800",
      keyPointBadge: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      keyPointText: "JUSTICE!",
  
      // Image
      imageAspectRatio: "aspect-[3/4]",
      imageBorder: "border-2 border-blue-300",
      imageHoverEffect: "hover:scale-105",
      imageCaption: "bg-gradient-to-t from-black/70 to-transparent",
      imagePrefix: "Issue",
      imageSuffix: "Cover",
  
      // Sources
      sourcesBorder: "border-blue-200",
      sourcesTitle: "text-blue-900",
      sourcesIcon: "text-blue-700",
      sourcesHighlight: "bg-blue-100",
      sourcesBox: "bg-gradient-to-r from-blue-50 to-gray-100 border-2 border-blue-200",
      sourcesText: "text-blue-800",
      sourcesLink: "text-blue-600",
      sourcesLinkIcon: "text-blue-600",
  
      // Popup
      popupBackground: "bg-gray-900",
      popupBorder: "border-2 border-blue-500",
      popupTitle: "text-blue-400",
      popupText: "text-gray-300",
      popupTail: "border-b-2 border-r-2 border-blue-500",
    },
  
    // Manga-inspired theme
    manga: {
      // General
      fontFamily: "font-sans",
      pageBackground: "bg-gradient-to-br from-gray-50 to-gray-100",
      contentBackground: "bg-white",
      loadingBackground: "bg-gradient-to-br from-gray-50 to-gray-100",
      loadingSpinner: "border-black",
      loadingIndicator: "bg-black",
  
      // Header
      headerGradient: "bg-black/60",
      titleText: "text-white",
      titleHighlight: "text-white font-bold",
      subtitleText: "text-white/90",
      titleTransform: "transform rotate-0",
      titlePrefix: "ザ・ストーリー・オブ",
      comicTagline: "An epic journey through knowledge and adventure!",
  
      // Navigation
      navigationBar: "bg-white",
      navButtonText: "text-black",
      navButtonHover: "hover:bg-gray-100 hover:shadow-md",
      chapterIndicator: "bg-black text-white",
      chapterPrefix: "第",
      chapterOf: "/",
      reelIndicator: "text-white bg-black",
  
      // Chapter Panel
      chapterPanel: "border-2 border-black bg-white",
      chapterBadge: "bg-black",
      chapterBadgeHighlight: "bg-gray-700",
      chapterLabel: "チャプター",
      chapterTitle: "text-black",
      chapterTitleBorder: "border-gray-200",
  
      // Content Layout - Manga typically reads right-to-left
      contentLayout: "flex flex-col lg:flex-row-reverse gap-6",
      textContentClass: "lg:w-1/2",
      imageContainerClass: "lg:w-1/2",
      imageAnimation: { x: -20 },
  
      // Narration
      narrationBox: "bg-white border-2 border-black",
      narrationAccent: "bg-black",
      narrationTitle: "text-black",
  
      // Chat Bubbles
      bubbleEvenAlignment: "ml-4",
      bubbleOddAlignment: "mr-4 text-right",
      bubbleEvenStyle: "rounded-bl-none text-left bg-white border-2 border-black",
      bubbleOddStyle: "rounded-br-none bg-white border-2 border-black",
      bubbleEvenTail: "rotate-45 -bottom-2 left-4 border-b-2 border-l-2 border-black bg-white",
      bubbleOddTail: "rotate-45 -bottom-2 right-4 border-b-2 border-r-2 border-black bg-white",
      bubbleEvenCharacter: "text-black",
      bubbleOddCharacter: "text-black",
      bubbleOddTextAlign: "text-right",
      avatarEvenStyle: "bg-white text-black border-black",
      avatarOddStyle: "bg-black text-white border-black",
  
      // Conclusion
      conclusionBox: "bg-white border-2 border-black",
      conclusionAccent: "bg-black",
      conclusionTitle: "text-black",
      keyPointBadge: "bg-black text-white",
      keyPointText: "重要!",
  
      // Image
      imageAspectRatio: "aspect-[3/4]",
      imageBorder: "border-2 border-black",
      imageHoverEffect: "hover:scale-105",
      imageCaption: "bg-black/70",
      imagePrefix: "イラスト",
      imageSuffix: "",
  
      // Sources
      sourcesBorder: "border-gray-200",
      sourcesTitle: "text-black",
      sourcesIcon: "text-black",
      sourcesHighlight: "bg-gray-100",
      sourcesBox: "bg-white border-2 border-black",
      sourcesText: "text-black",
      sourcesLink: "text-black",
      sourcesLinkIcon: "text-black",
  
      // Popup
      popupBackground: "bg-white",
      popupBorder: "border-2 border-black",
      popupTitle: "text-black",
      popupText: "text-black",
      popupTail: "border-b-2 border-r-2 border-black",
    },
  
    // Indie comic theme
    indie: {
      // General
      fontFamily: "font-mono",
      pageBackground: "bg-gradient-to-br from-amber-50 to-orange-50",
      contentBackground: "bg-amber-50",
      loadingBackground: "bg-gradient-to-br from-amber-50 to-orange-50",
      loadingSpinner: "border-amber-600",
      loadingIndicator: "bg-gradient-to-r from-amber-600 to-orange-600",
  
      // Header
      headerGradient: "bg-gradient-to-r from-amber-900/80 to-orange-800/70",
      titleText: "text-white",
      titleHighlight: "text-green-300",
      subtitleText: "text-white/90",
      titleTransform: "transform rotate-1",
      titlePrefix: "An Indie Story About",
      comicTagline: "A handcrafted tale of discovery and wonder!",
  
      // Navigation
      navigationBar: "bg-amber-100",
      navButtonText: "text-amber-800",
      navButtonHover: "hover:bg-amber-200 hover:shadow-md",
      chapterIndicator: "bg-amber-200 text-amber-800",
      chapterPrefix: "Part",
      chapterOf: "of",
      reelIndicator: "text-amber-800 bg-amber-200",
  
      // Chapter Panel
      chapterPanel: "border-4 border-dashed border-amber-800 bg-amber-50",
      chapterBadge: "bg-amber-800",
      chapterBadgeHighlight: "bg-amber-700",
      chapterLabel: "PART",
      chapterTitle: "text-amber-900",
      chapterTitleBorder: "border-amber-300 border-dashed",
  
      // Content Layout - Creative layout with image on top for mobile
      contentLayout: "flex flex-col gap-6",
      textContentClass: "w-full",
      imageContainerClass: "w-full",
      imageAnimation: { x: 0 },
  
      // Narration
      narrationBox: "bg-amber-100 border-2 border-dashed border-amber-600",
      narrationAccent: "bg-amber-600",
      narrationTitle: "text-amber-800",
  
      // Chat Bubbles
      bubbleEvenAlignment: "ml-4",
      bubbleOddAlignment: "mr-4 text-right",
      bubbleEvenStyle: "rounded-bl-none text-left bg-green-100 border-2 border-dashed border-green-600",
      bubbleOddStyle: "rounded-br-none bg-orange-100 border-2 border-dashed border-orange-600",
      bubbleEvenTail: "rotate-45 -bottom-2 left-4 border-b-2 border-l-2 border-dashed border-green-600 bg-green-100",
      bubbleOddTail: "rotate-45 -bottom-2 right-4 border-b-2 border-r-2 border-dashed border-orange-600 bg-orange-100",
      bubbleEvenCharacter: "text-green-700",
      bubbleOddCharacter: "text-orange-700",
      bubbleOddTextAlign: "text-right",
      avatarEvenStyle: "bg-green-600 text-white border-dashed border-green-800",
      avatarOddStyle: "bg-orange-600 text-white border-dashed border-orange-800",
  
      // Conclusion
      conclusionBox: "bg-amber-100 border-2 border-dashed border-amber-600",
      conclusionAccent: "bg-amber-600",
      conclusionTitle: "text-amber-800",
      keyPointBadge: "bg-green-600 text-white",
      keyPointText: "INSIGHT!",
  
      // Image
      imageAspectRatio: "aspect-square",
      imageBorder: "border-4 border-dashed border-amber-600",
      imageHoverEffect: "hover:rotate-1 hover:scale-105",
      imageCaption: "bg-gradient-to-t from-amber-900/70 to-transparent",
      imagePrefix: "Sketch",
      imageSuffix: "",
  
      // Sources
      sourcesBorder: "border-amber-300 border-dashed",
      sourcesTitle: "text-amber-900",
      sourcesIcon: "text-amber-700",
      sourcesHighlight: "bg-amber-200",
      sourcesBox: "bg-amber-100 border-2 border-dashed border-amber-600",
      sourcesText: "text-amber-800",
      sourcesLink: "text-amber-700",
      sourcesLinkIcon: "text-amber-700",
  
      // Popup
      popupBackground: "bg-amber-50",
      popupBorder: "border-2 border-dashed border-amber-600",
      popupTitle: "text-amber-800",
      popupText: "text-amber-900",
      popupTail: "border-b-2 border-r-2 border-dashed border-amber-600",
    },
  }
  
import { useRef, useEffect } from "react"

const AudioComponent = ({ src, className, isControl = true }: { src: string, className: string, isControl?: boolean }) => {
  const audioRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Failed to play audio automatically:", error)
      })
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <img
      src={'/soundicon.webp'}
      alt="Autdio placeholder"
      className="absolute inset-0 w-full h-full object-cover"
      />
      <audio
        ref={audioRef}
        src={src}
        loop
        muted
        controls={isControl}
        controlsList="nodownload"
        className={className}
      />
    </div>
  )
}

export default AudioComponent

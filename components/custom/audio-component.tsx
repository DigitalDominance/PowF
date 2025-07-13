import { useRef, useEffect } from "react"

const AudioComponent = ({ src, className }: { src: string, className: string }) => {
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
        controls
        className={className}
      />
    </div>
  )
}

export default AudioComponent

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
    <audio
      ref={audioRef}
      src={src}
      loop
      muted
      className={className}
    />
  )
}

export default AudioComponent
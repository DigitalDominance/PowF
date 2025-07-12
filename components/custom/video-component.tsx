import { useRef, useEffect } from "react"

const VideoComponent = ({ src, className }: { src: string, className: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Failed to play video automatically:", error)
      })
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      className={className}
    />
  )
}

export default VideoComponent
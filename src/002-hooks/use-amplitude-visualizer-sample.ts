// hooks/use-amplitude-visualizer-sample.ts

import { useEffect, useRef, useState, useCallback } from 'react'

export interface UseAmplitudeVisualizerResult {
  amplitudes: number[]
  start: (stream: MediaStream) => void
  stop: () => void
}

export function useAmplitudeVisualizer(sensitivity: number = 1): UseAmplitudeVisualizerResult {
  const [amplitudes, setAmplitudes] = useState<number[]>([])

  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const animationRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const visualize = useCallback((): void => {
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current
    if (!analyser || !dataArray) return

    analyser.getByteTimeDomainData(dataArray)

    const max = Math.max(...dataArray)
    const min = Math.min(...dataArray)
    const raw = Math.abs(max - min)
    const scaled = Math.min(255, raw * sensitivity)

    setAmplitudes((prev) => [...prev.slice(-47), scaled])

    animationRef.current = requestAnimationFrame(visualize)
  }, [sensitivity])

  const start = useCallback(
    (stream: MediaStream): void => {
      stop()

      const audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx

      const source = audioCtx.createMediaStreamSource(stream)

      const gainNode = audioCtx.createGain()
      gainNode.gain.value = sensitivity

      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 128
      analyserRef.current = analyser

      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)

      source.connect(gainNode)
      gainNode.connect(analyser)

      animationRef.current = requestAnimationFrame(visualize)
    },
    [sensitivity, visualize]
  )

  const stop = useCallback((): void => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    setAmplitudes([])
  }, [])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return { amplitudes, start, stop }
}

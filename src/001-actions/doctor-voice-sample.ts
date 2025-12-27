import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export interface DoctorVoiceSampleResponse {
  voiceEmbeddingReady: boolean
  voiceUpdatedAt?: string
}

export async function sendDoctorVoiceSample(doctorId: string, audioFiles: Blob[]): Promise<DoctorVoiceSampleResponse> {
  const form = new FormData()

  audioFiles.forEach((blob, index) => {
    const ext = blob.type.split('/')[1] || 'wav'
    const file = new File([blob], `voice_sample_${index + 1}.${ext}`, { type: blob.type })
    form.append('files', file) // ← use “files” (plural)
  })

  const { data } = await axios.post<DoctorVoiceSampleResponse>(`${API_URL}/doctor/voice-sample`, form, {
    params: { doctorId },
  })

  return data
}

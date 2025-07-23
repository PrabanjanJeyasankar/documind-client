import { DoctorVoiceSampleResponse, sendDoctorVoiceSample } from '@/001-actions/doctor-voice-sample'
import { useMutation } from '@tanstack/react-query'

export function useSendDoctorVoiceSample() {
  return useMutation<
    DoctorVoiceSampleResponse,
    Error,
    {
      doctorId: string
      audioFiles: Blob[]
    }
  >({
    mutationFn: ({ doctorId, audioFiles }) => sendDoctorVoiceSample(doctorId, audioFiles),
  })
}

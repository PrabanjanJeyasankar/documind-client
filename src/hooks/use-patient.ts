import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPatientsByDoctor, createPatient, fetchPatientById } from '@/actions/patient'
import type { Patient } from '@/types'

// Fetch patients
export function usePatients(doctorId: string) {
  return useQuery<Patient[]>({
    queryKey: ['patients', doctorId],
    queryFn: () => fetchPatientsByDoctor(doctorId),
    enabled: !!doctorId,
    refetchOnWindowFocus: true,
  })
}

export function usePatientDetails(patientId: string) {
  return useQuery<Patient>({
    queryKey: ['patient', patientId],
    queryFn: () => fetchPatientById(patientId),
    enabled: !!patientId,
    staleTime: 60_000,
  })
}

// Create patient
export function useCreatePatient(doctorId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', doctorId] })
    },
  })
}

import { Card, CardContent } from '@/components/ui/card'
import { User, Mail, Phone, Home, Droplet, Info, ListChecks, ChevronLeft, Heart, Shield, Tag, Cake } from 'lucide-react'
import type { Patient } from '@/types'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { calculateAgeFromDate } from '@/utils/chat-conversation'

interface PatientDetailsCardProps {
  patient: Patient
}

export function PatientDetailsCard({ patient }: PatientDetailsCardProps) {
  const router = useRouter()

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy')
    } catch {
      return 'N/A'
    }
  }

  const age = patient.dateOfBirth ? calculateAgeFromDate(patient.dateOfBirth) : null

  return (
    <Card className='shadow-none bg-sidebar-accent border-none font-sans overflow-hidden !pt-2'>
      <div className='pl-2 pb-0'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => router.back()}
          className='font-sans px-3 py-1.5 h-auto text-xs hover:bg-sidebar-accent-foreground/5 transition-colors'>
          <ChevronLeft className='w-3.5 h-3.5 mr-1.5' />
          Back
        </Button>
      </div>

      <CardContent className='p-6 pt-4 space-y-6'>
        <div className='flex items-start gap-4'>
          <div className='w-12 h-12 rounded-full bg-sidebar-accent-foreground/10 flex items-center justify-center text-sidebar-accent-foreground font-semibold text-sm'>
            {getInitials(patient.firstName, patient.lastName)}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <h1 className='text-xl font-semibold text-sidebar-accent-foreground truncate'>
                {patient.firstName} {patient.lastName}
              </h1>
            </div>
            <div className='text-xs text-muted-foreground'>
              ID:
              <span className='font-mono bg-sidebar-accent-foreground/5 px-1.5 py-0.5 rounded text-[11px]'>
                {patient.externalId || patient.id}
              </span>
            </div>
          </div>
        </div>

        <div className='space-y-3'>
          <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2'>
            <User className='w-4 h-4' />
            Contact
          </h2>
          <div className='space-y-2.5 ml-6'>
            <div className='flex items-center gap-3 group'>
              <Cake className='w-4 h-4 text-muted-foreground group-hover:text-sidebar-accent-foreground transition-colors' />
              <span className='text-sm text-sidebar-accent-foreground'>
                {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'No DOB'}
                {age !== null && <span className='text-muted-foreground text-xs ml-2'>(Age: {age})</span>}
              </span>
            </div>

            <div className='flex items-center gap-3 group'>
              <Mail className='w-4 h-4 text-muted-foreground group-hover:text-sidebar-accent-foreground transition-colors' />
              {patient.contactEmail ? (
                <a
                  href={`mailto:${patient.contactEmail}`}
                  className='text-sm text-sidebar-accent-foreground hover:underline truncate'>
                  {patient.contactEmail}
                </a>
              ) : (
                <span className='text-sm text-muted-foreground'>No email</span>
              )}
            </div>

            <div className='flex items-center gap-3 group'>
              <Phone className='w-4 h-4 text-muted-foreground group-hover:text-sidebar-accent-foreground transition-colors' />
              {patient.contactPhone ? (
                <a
                  href={`tel:${patient.contactPhone}`}
                  className='text-sm text-sidebar-accent-foreground hover:underline'>
                  {patient.contactPhone}
                </a>
              ) : (
                <span className='text-sm text-muted-foreground'>No phone</span>
              )}
            </div>

            <div className='flex items-start gap-3 group'>
              <Home className='w-4 h-4 text-muted-foreground group-hover:text-sidebar-accent-foreground transition-colors mt-0.5' />
              <span className='text-sm text-sidebar-accent-foreground'>
                {patient.address || <span className='text-muted-foreground'>No address</span>}
              </span>
            </div>
          </div>
        </div>

        <div className='space-y-3'>
          <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2'>
            <Heart className='w-4 h-4' />
            Medical
          </h2>
          <div className='space-y-2.5 ml-6'>
            <div className='flex items-center gap-3'>
              <Droplet className='w-4 h-4 text-muted-foreground' />
              <span className='text-sm text-sidebar-accent-foreground'>
                Blood:{' '}
                {patient.bloodType ? (
                  <span className='font-medium'>{patient.bloodType}</span>
                ) : (
                  <span className='text-muted-foreground'>Unknown</span>
                )}
              </span>
            </div>

            {patient.gender && (
              <div className='flex items-center gap-3'>
                <Info className='w-4 h-4 text-muted-foreground' />
                <span className='text-sm text-sidebar-accent-foreground'>
                  Gender: <span className='font-medium'>{patient.gender}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {((patient.allergies && patient.allergies.length > 0) ||
          (patient.chronicConditions && patient.chronicConditions.length > 0)) && (
          <div className='space-y-3'>
            <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2'>
              <Shield className='w-4 h-4' />
              Conditions
            </h2>
            <div className='space-y-2.5 ml-6'>
              {patient.allergies && patient.allergies.length > 0 && (
                <div className='flex items-start gap-3'>
                  <ListChecks className='w-4 h-4 text-muted-foreground mt-0.5' />
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm text-sidebar-accent-foreground mb-1'>Allergies</div>
                    <div className='flex flex-wrap gap-1.5'>
                      {patient.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className='text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-200'>
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                <div className='flex items-start gap-3'>
                  <ListChecks className='w-4 h-4 text-muted-foreground mt-0.5' />
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm text-sidebar-accent-foreground mb-1'>Chronic</div>
                    <div className='flex flex-wrap gap-1.5'>
                      {patient.chronicConditions.map((condition, index) => (
                        <span
                          key={index}
                          className='text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full border border-orange-200'>
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {((patient.medicalTags && patient.medicalTags.length > 0) || patient.notes) && (
          <div className='space-y-3'>
            <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2'>
              <Tag className='w-4 h-4' />
              Additional
            </h2>
            <div className='space-y-2.5 ml-6'>
              {patient.medicalTags && patient.medicalTags.length > 0 && (
                <div className='flex items-start gap-3'>
                  <Tag className='w-4 h-4 text-muted-foreground mt-0.5' />
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm text-sidebar-accent-foreground mb-1'>Tags</div>
                    <div className='flex flex-wrap gap-1.5'>
                      {patient.medicalTags.map((tag, index) => (
                        <span
                          key={index}
                          className='text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200'>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {patient.notes && (
                <div className='flex items-start gap-3'>
                  <Info className='w-4 h-4 text-muted-foreground mt-0.5' />
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm text-sidebar-accent-foreground mb-1'>Notes</div>
                    <div className='text-sm text-muted-foreground bg-sidebar-accent-foreground/5 p-3 rounded-lg'>
                      {patient.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import React, { FC } from 'react'
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

export const PatientDetailsCard: FC<PatientDetailsCardProps> = ({ patient }) => {
  const router = useRouter()

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

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
      {/* Header with Back button and Patient Avatar/Name */}
      <div className='flex items-center justify-between px-4 py-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => router.back()}
          className='font-sans px-3 py-1.5 h-auto text-xs hover:bg-sidebar-accent-foreground/5 transition-colors'>
          <ChevronLeft className='w-3.5 h-3.5 mr-1.5' />
          Back
        </Button>

        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 rounded-full bg-sidebar-accent-foreground/10 flex items-center justify-center text-sidebar-accent-foreground font-semibold text-sm'>
            {getInitials(patient.firstName, patient.lastName)}
          </div>
          <div className='min-w-0'>
            <h1 className='text-xl font-semibold text-sidebar-accent-foreground truncate'>
              {patient.firstName} {patient.lastName}
            </h1>
            <div className='text-xs text-muted-foreground'>
              ID:{' '}
              <span className='font-mono bg-sidebar-accent-foreground/5 px-1.5 py-0.5 rounded text-[11px]'>
                {patient.externalId || patient.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className='px-6 pt-4 pb-6'>
        {/* Contact Section */}
        <section className='space-y-3'>
          <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2'>
            <User className='w-4 h-4' />
            Contact
          </h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ml-6'>
            <div className='flex items-center gap-2 bg-sidebar-accent-foreground/5 rounded p-3'>
              <Cake className='w-5 h-5 text-muted-foreground' />
              <div>
                <div className='text-xs text-muted-foreground'>DOB</div>
                <div className='text-sm text-sidebar-accent-foreground'>
                  {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'No DOB'}
                  {age !== null && <span className='text-xs text-muted-foreground ml-1'>(Age: {age})</span>}
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2 bg-sidebar-accent-foreground/5 rounded p-3'>
              <Mail className='w-5 h-5 text-muted-foreground' />
              <div>
                <div className='text-xs text-muted-foreground'>Email</div>
                {patient.contactEmail ? (
                  <a
                    href={`mailto:${patient.contactEmail}`}
                    className='text-sm text-sidebar-accent-foreground hover:underline block truncate max-w-xs'>
                    {patient.contactEmail}
                  </a>
                ) : (
                  <div className='text-sm text-muted-foreground'>No email</div>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2 bg-sidebar-accent-foreground/5 rounded p-3'>
              <Phone className='w-5 h-5 text-muted-foreground' />
              <div>
                <div className='text-xs text-muted-foreground'>Phone</div>
                {patient.contactPhone ? (
                  <a
                    href={`tel:${patient.contactPhone}`}
                    className='text-sm text-sidebar-accent-foreground hover:underline'>
                    {patient.contactPhone}
                  </a>
                ) : (
                  <div className='text-sm text-muted-foreground'>No phone</div>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2 bg-sidebar-accent-foreground/5 rounded p-3'>
              <Home className='w-5 h-5 text-muted-foreground' />
              <div>
                <div className='text-xs text-muted-foreground'>Address</div>
                <div className='text-sm text-sidebar-accent-foreground'>
                  {patient.address || <span className='text-muted-foreground'>No address</span>}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Medical Section */}
        <section className='space-y-3 mt-6'>
          <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2'>
            <Heart className='w-4 h-4' />
            Medical
          </h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ml-6'>
            <div className='flex items-center gap-2 bg-sidebar-accent-foreground/5 rounded p-3'>
              <Droplet className='w-5 h-5 text-muted-foreground' />
              <div>
                <div className='text-xs text-muted-foreground'>Blood Type</div>
                <div className='text-sm text-sidebar-accent-foreground'>
                  {patient.bloodType ? (
                    <span className='font-medium'>{patient.bloodType}</span>
                  ) : (
                    <span className='text-muted-foreground'>Unknown</span>
                  )}
                </div>
              </div>
            </div>

            {patient.gender && (
              <div className='flex items-center gap-2 bg-sidebar-accent-foreground/5 rounded p-3'>
                <Info className='w-5 h-5 text-muted-foreground' />
                <div>
                  <div className='text-xs text-muted-foreground'>Gender</div>
                  <div className='text-sm text-sidebar-accent-foreground font-medium'>{patient.gender}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Conditions Section */}
        {((patient.allergies && patient.allergies.length > 0) ||
          (patient.chronicConditions && patient.chronicConditions.length > 0)) && (
          <section className='space-y-3 mt-6'>
            <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2'>
              <Shield className='w-4 h-4' />
              Conditions
            </h2>

            <div className='ml-6'>
              {patient.allergies && patient.allergies.length > 0 && (
                <div className='mb-4'>
                  <div className='text-sm font-semibold mb-2'>Allergies</div>
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                    {patient.allergies.map((allergy, i) => (
                      <span
                        key={i}
                        className='text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-200'>
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                <div>
                  <div className='text-sm font-semibold mb-2'>Chronic Conditions</div>
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                    {patient.chronicConditions.map((condition, i) => (
                      <span
                        key={i}
                        className='text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full border border-orange-200'>
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Additional Section */}
        {((patient.medicalTags && patient.medicalTags.length > 0) || patient.notes) && (
          <section className='space-y-3 mt-6'>
            <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2'>
              <Tag className='w-4 h-4' />
              Additional
            </h2>

            <div className='ml-6'>
              {patient.medicalTags && patient.medicalTags.length > 0 && (
                <div className='mb-4'>
                  <div className='text-sm font-semibold mb-2'>Tags</div>
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                    {patient.medicalTags.map((tag, i) => (
                      <span
                        key={i}
                        className='text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200'>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {patient.notes && (
                <div>
                  <div className='text-sm font-semibold mb-2'>Notes</div>
                  <div className='text-sm text-muted-foreground bg-sidebar-accent-foreground/5 p-3 rounded-lg'>
                    {patient.notes}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  )
}

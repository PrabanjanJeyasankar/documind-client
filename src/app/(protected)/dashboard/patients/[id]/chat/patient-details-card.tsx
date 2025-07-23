import React, { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { User, Mail, Phone, Home, Droplet, Info, ChevronLeft, Heart, Shield, Tag, Cake } from 'lucide-react'
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
      <div className='flex flex-col items-start justify-between gap-6 px-4 py-2'>
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

      <CardContent className='px-6 pb-6'>
        <div className='grid grid-cols-12 gap-4 auto-rows-auto'>
          {/* Contact Information */}
          <div className='col-span-12 lg:col-span-8'>
            <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2 mb-4'>
              <User className='w-4 h-4' />
              Contact Information
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {/* DOB & Age  */}
              <div className='md:col-span-2 flex items-center gap-4 bg-sidebar-accent-foreground/5 rounded-lg p-4 border border-sidebar-accent-foreground/10'>
                <div className='w-12 h-12 rounded-full bg-sidebar-accent-foreground/10 flex items-center justify-center'>
                  <Cake className='w-6 h-6 text-sidebar-accent-foreground/70' />
                </div>
                <div className='flex-1'>
                  <div className='text-xs text-muted-foreground uppercase tracking-wide'>Date of Birth</div>
                  <div className='text-lg font-semibold text-sidebar-accent-foreground'>
                    {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'No DOB'}
                  </div>
                  {age !== null && <div className='text-sm text-muted-foreground'>Age: {age} years old</div>}
                </div>
              </div>

              {/* Email */}
              <div className='md:col-span-2 flex items-start gap-3 bg-sidebar-accent-foreground/5 rounded-lg p-4'>
                <Mail className='w-5 h-5 text-muted-foreground mt-0.5' />
                <div className='flex-1 min-w-0'>
                  <div className='text-xs text-muted-foreground uppercase tracking-wide mb-1'>Email</div>
                  {patient.contactEmail ? (
                    <a
                      href={`mailto:${patient.contactEmail}`}
                      className='text-sm text-sidebar-accent-foreground hover:underline block truncate'>
                      {patient.contactEmail}
                    </a>
                  ) : (
                    <div className='text-sm text-muted-foreground'>No email provided</div>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className=' md:col-span-2 flex items-start gap-3 bg-sidebar-accent-foreground/5 rounded-lg p-4'>
                <Phone className='w-5 h-5 text-muted-foreground mt-0.5' />
                <div className='flex-1'>
                  <div className='text-xs text-muted-foreground uppercase tracking-wide mb-1'>Phone</div>
                  {patient.contactPhone ? (
                    <a
                      href={`tel:${patient.contactPhone}`}
                      className='text-sm text-sidebar-accent-foreground hover:underline'>
                      {patient.contactPhone}
                    </a>
                  ) : (
                    <div className='text-sm text-muted-foreground'>No phone provided</div>
                  )}
                </div>
              </div>

              {/* Address - Full Width */}
              <div className='md:col-span-2 flex items-start gap-3 bg-sidebar-accent-foreground/5 rounded-lg p-4'>
                <Home className='w-5 h-5 text-muted-foreground mt-0.5' />
                <div className='flex-1'>
                  <div className='text-xs text-muted-foreground uppercase tracking-wide mb-1'>Address</div>
                  <div className='text-sm text-sidebar-accent-foreground'>
                    {patient.address || <span className='text-muted-foreground'>No address provided</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information - Sidebar */}
          <div className='col-span-12 lg:col-span-4'>
            <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2 mb-4'>
              <Heart className='w-4 h-4' />
              Medical
            </h2>

            <div className='space-y-3'>
              {/* Blood Type */}
              <div className='flex items-center gap-3 bg-sidebar-accent-foreground/5 rounded-lg p-4'>
                <Droplet className='w-5 h-5 text-muted-foreground' />
                <div>
                  <div className='text-xs text-muted-foreground uppercase tracking-wide'>Blood Type</div>
                  <div className='text-sm text-sidebar-accent-foreground'>
                    {patient.bloodType ? (
                      <span className='font-medium'>{patient.bloodType}</span>
                    ) : (
                      <span className='text-muted-foreground'>Unknown</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Gender */}
              {patient.gender && (
                <div className='flex items-center gap-3 bg-sidebar-accent-foreground/5 rounded-lg p-4'>
                  <Info className='w-5 h-5 text-muted-foreground' />
                  <div>
                    <div className='text-xs text-muted-foreground uppercase tracking-wide'>Gender</div>
                    <div className='text-sm text-sidebar-accent-foreground font-medium'>{patient.gender}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conditions */}
          {((patient.allergies && patient.allergies.length > 0) ||
            (patient.chronicConditions && patient.chronicConditions.length > 0)) && (
            <div className='col-span-12'>
              <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2 mb-4'>
                <Shield className='w-4 h-4' />
                Medical Conditions
              </h2>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className='bg-sidebar-accent-foreground/5 rounded-lg p-4'>
                    <div className='text-sm font-semibold mb-3'>Allergies</div>
                    <div className='flex flex-wrap gap-2'>
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
                  <div className='bg-sidebar-accent-foreground/5 rounded-lg p-4'>
                    <div className='text-sm font-semibold mb-3'>Chronic Conditions</div>
                    <div className='flex flex-wrap gap-2'>
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
            </div>
          )}

          {/* Additional Information - Full Width */}
          {((patient.medicalTags && patient.medicalTags.length > 0) || patient.notes) && (
            <div className='col-span-12'>
              <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2 mb-4'>
                <Tag className='w-4 h-4' />
                Additional Information
              </h2>

              <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                {/* Tags */}
                {patient.medicalTags && patient.medicalTags.length > 0 && (
                  <div className='lg:col-span-1 bg-sidebar-accent-foreground/5 rounded-lg p-4'>
                    <div className='text-sm font-semibold mb-3'>Tags</div>
                    <div className='flex flex-wrap gap-2'>
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

                {/* Notes */}
                {patient.notes && (
                  <div
                    className={`${
                      patient.medicalTags && patient.medicalTags.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'
                    } bg-sidebar-accent-foreground/5 rounded-lg p-4`}>
                    <div className='text-sm font-semibold mb-3'>Notes</div>
                    <div className='text-sm text-muted-foreground'>{patient.notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

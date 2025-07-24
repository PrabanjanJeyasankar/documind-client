'use client'

import React, { FC } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { User, Mail, Phone, Home, Droplet, Info, ChevronLeft, Heart, Tag, Cake } from 'lucide-react'
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
    <Card className='shadow-none bg-sidebar-accent border-none font-sans rounded-xl overflow-hidden !pt-2 !pb-0 h-full flex flex-col gap-4'>
      <div className='sticky top-0 z-10 bg-sidebar-accent px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-sidebar-accent/80'>
        <div className='flex flex-col items-start gap-6'>
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
                ID:
                <span className=' ml-1 font-mono bg-sidebar-accent-foreground/5 px-1.5 py-0.5 rounded text-[11px]'>
                  {patient.externalId || patient.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CardContent className='px-6 pb-6 flex-1 overflow-y-auto scroll-thin-hover'>
        <div className='grid grid-cols-1 xs:grid-cols-2 gap-6'>
          <section className='flex flex-col gap-3'>
            <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2 mb-1'>
              <User className='w-4 h-4' />
              Contact Information
            </h2>

            {/* DOB */}
            <div className='flex items-center gap-4 bg-sidebar-accent-foreground/5 rounded-lg p-4 border border-sidebar-accent-foreground/10'>
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
            <div className='flex items-start gap-3 bg-sidebar-accent-foreground/5 rounded-lg p-4'>
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
            <div className='flex items-start gap-3 bg-sidebar-accent-foreground/5 rounded-lg p-4'>
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

            {/* Address */}
            <div className='flex items-start gap-3 bg-sidebar-accent-foreground/5 rounded-lg p-4'>
              <Home className='w-5 h-5 text-muted-foreground mt-0.5' />
              <div className='flex-1'>
                <div className='text-xs text-muted-foreground uppercase tracking-wide mb-1'>Address</div>
                <div className='text-sm text-sidebar-accent-foreground'>
                  {patient.address || <span className='text-muted-foreground'>No address provided</span>}
                </div>
              </div>
            </div>
          </section>

          <section className='flex flex-col gap-3 '>
            <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2 mb-1'>
              <Heart className='w-4 h-4' />
              Medical
            </h2>

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

            {/* Allergies */}
            {patient.allergies?.length > 0 && (
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

            {/* Conditions */}
            {patient.chronicConditions?.length > 0 && (
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
          </section>
        </div>

        {(patient.medicalTags?.length || patient.notes) && (
          <section className='lg:col-span-2 flex flex-col gap-3 mt-6'>
            <h2 className='text-sm font-medium text-sidebar-accent-foreground/80 flex items-center gap-2 mb-1'>
              <Tag className='w-4 h-4' />
              Additional Information
            </h2>

            {patient.medicalTags?.length > 0 && (
              <div className='bg-sidebar-accent-foreground/5 rounded-lg p-4'>
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
              <div className='bg-sidebar-accent-foreground/5 rounded-lg p-4'>
                <div className='text-sm font-semibold mb-3'>Notes</div>
                <div className='text-sm text-muted-foreground'>{patient.notes}</div>
              </div>
            )}
          </section>
        )}
      </CardContent>
    </Card>
  )
}

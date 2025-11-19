'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Header } from '@/components/header';
import { ResumeBuilder } from '@/components/resume-builder';
import { ResumeViewer } from '@/components/resume-viewer';
import { useEffect, useState } from 'react';
import type { ResumeData } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

const resumeSchema = (t: (key: string) => string) => z.object({
  profileType: z.enum(['white-collar', 'blue-collar', 'grey-collar'], {
    required_error: t('errors.profileTypeRequired'),
  }),
  versionName: z.string().min(1, t('errors.versionNameRequired')),
  personalInfo: z.object({
    name: z.string().min(1, t('errors.nameRequired')),
    email: z.string().email(t('errors.emailInvalid')),
    phone: z.string().min(1, t('errors.phoneRequired')),
    location: z.string().min(1, t('errors.locationRequired')),
    website: z.string().url(t('errors.websiteInvalid')).or(z.literal('')),
    summary: z.string().min(10, t('errors.summaryTooShort')),
    photoUrl: z.string().optional(),
  }),
  experience: z.array(z.object({
    id: z.string(),
    company: z.string().min(1, t('errors.companyRequired')),
    role: z.string().min(1, t('errors.roleRequired')),
    startDate: z.string().min(1, t('errors.startDateRequired')),
    endDate: z.string(),
    description: z.string().min(1, t('errors.descriptionRequired')),
  })),
  education: z.array(z.object({
    id: z.string(),
    institution: z.string().min(1, t('errors.institutionRequired')),
    degree: z.string().min(1, t('errors.degreeRequired')),
    fieldOfStudy: z.string().min(1, t('errors.fieldOfStudyRequired')),
    graduationYear: z.string().min(4, t('errors.yearInvalid')).max(4),
  })),
  skills: z.array(z.string()),
  notes: z.string(),
});


export default function BuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const form = useForm<z.infer<ReturnType<typeof resumeSchema>>>({
    resolver: zodResolver(resumeSchema(t)),
    defaultValues: {
      profileType: 'white-collar',
      versionName: t('builder.defaultVersionName'),
      personalInfo: { name: t('builder.defaultName'), email: 'your.email@example.com', phone: '9876543210', location: t('builder.defaultLocation'), website: '', summary: t('builder.defaultSummary'), photoUrl: '' },
      experience: [],
      education: [],
      skills: [],
      notes: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset({
      profileType: 'white-collar',
      versionName: t('builder.defaultVersionName'),
      personalInfo: { name: t('builder.defaultName'), email: 'your.email@example.com', phone: '9876543210', location: t('builder.defaultLocation'), website: '', summary: t('builder.defaultSummary'), photoUrl: '' },
      experience: [],
      education: [],
      skills: [],
      notes: '',
    });
  }, [language]);

  const watchedData = form.watch();

  useEffect(() => {
    const subscription = form.watch((value) => {
      const dataWithId = { ...value, id: 'live-preview', lang: language } as ResumeData;
      setResumeData(dataWithId);
    });
    // Set initial data for preview
    const dataWithId = { ...form.getValues(), id: 'live-preview', lang: language } as ResumeData;
    setResumeData(dataWithId);

    return () => subscription.unsubscribe();
  }, [form, language]);

  const onSubmit = (data: z.infer<ReturnType<typeof resumeSchema>>) => {
    const resumeId = uuidv4();
    const fullResumeData = { ...data, id: resumeId, lang: language };
    try {
      localStorage.setItem('swar-resume-data', JSON.stringify(fullResumeData));
      toast({
        title: t('toast.resumeSaved.title'),
        description: t('toast.resumeSaved.description'),
      });
      router.push(`/resume/${resumeId}`);
    } catch (error) {
      console.error("Failed to save resume to local storage", error);
      toast({
        variant: 'destructive',
        title: t('toast.saveError.title'),
        description: t('toast.saveError.description'),
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 lg:h-[calc(100vh-57px)] overflow-hidden relative">
        <div className={`lg:overflow-y-auto ${showPreview ? '' : 'lg:col-span-2'}`}>
          <ResumeBuilder form={form} onSubmit={onSubmit} />
        </div>
        
        <div className="absolute top-4 right-4 z-20 hidden lg:block">
            <Button variant="outline" size="icon" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? <EyeOff /> : <Eye />}
              <span className="sr-only">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </Button>
        </div>

        {showPreview && (
            <div className="hidden lg:block bg-muted/20 lg:overflow-y-auto p-4">
            {resumeData ? (
                <div className="transform scale-[0.85] origin-top">
                    <ResumeViewer resumeData={resumeData} isPreview />
                </div>
            ) : null}
            </div>
        )}
      </div>
    </div>
  );
}

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
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const resumeSchema = z.object({
  profileType: z.enum(['white-collar', 'blue-collar', 'grey-collar'], {
    required_error: 'You need to select a profile type.',
  }),
  versionName: z.string().min(1, 'Version name is required.'),
  personalInfo: z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('Invalid email address.'),
    phone: z.string().min(1, 'Phone number is required.'),
    location: z.string().min(1, 'Location is required.'),
    website: z.string().url('Invalid URL.').or(z.literal('')),
    summary: z.string().min(10, 'Summary should be at least 10 characters.'),
    photoUrl: z.string().optional(),
  }),
  experience: z.array(z.object({
    id: z.string(),
    company: z.string().min(1, 'Company name is required.'),
    role: z.string().min(1, 'Role is required.'),
    startDate: z.string().min(1, 'Start date is required.'),
    endDate: z.string(),
    description: z.string().min(1, 'Description is required.'),
  })),
  education: z.array(z.object({
    id: z.string(),
    institution: z.string().min(1, 'Institution is required.'),
    degree: z.string().min(1, 'Degree is required.'),
    fieldOfStudy: z.string().min(1, 'Field of study is required.'),
    graduationYear: z.string().min(4, 'Enter a valid year.').max(4),
  })),
  skills: z.array(z.string()),
  notes: z.string(),
});

export default function BuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  const form = useForm<z.infer<typeof resumeSchema>>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      profileType: 'white-collar',
      versionName: 'My First Resume',
      personalInfo: { name: 'Your Name', email: 'your.email@example.com', phone: '9876543210', location: 'City, Country', website: '', summary: 'A brief professional summary about you.', photoUrl: '' },
      experience: [],
      education: [],
      skills: [],
      notes: '',
    },
    mode: 'onChange',
  });

  const watchedData = form.watch();

  useEffect(() => {
    const subscription = form.watch((value) => {
      const dataWithId = { ...value, id: 'live-preview' } as ResumeData;
      setResumeData(dataWithId);
    });
    // Set initial data for preview
    const dataWithId = { ...form.getValues(), id: 'live-preview' } as ResumeData;
    setResumeData(dataWithId);

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = (data: z.infer<typeof resumeSchema>) => {
    const resumeId = uuidv4();
    const fullResumeData = { ...data, id: resumeId };
    try {
      localStorage.setItem('kagaz-pro-resume', JSON.stringify(fullResumeData));
      toast({
        title: 'Resume Saved!',
        description: 'Redirecting to your shareable resume page.',
      });
      router.push(`/resume/${resumeId}`);
    } catch (error) {
      console.error("Failed to save resume to local storage", error);
      toast({
        variant: 'destructive',
        title: 'Save Error',
        description: 'Could not save resume. Your browser storage might be full.',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 lg:h-[calc(100vh-57px)] overflow-hidden">
        <div className="lg:overflow-y-auto">
          <ResumeBuilder form={form} onSubmit={onSubmit} />
        </div>
        <div className="hidden lg:block bg-muted/20 lg:overflow-y-auto p-4">
           <div className="sticky top-0 z-10 py-4 bg-muted/20 backdrop-blur-sm flex justify-end">
              <Button onClick={form.handleSubmit(onSubmit)} size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Generating...' : 'Save & Get Shareable Link'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          {resumeData ? (
            <div className="transform scale-[0.85] origin-top">
                <ResumeViewer resumeData={resumeData} isPreview />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

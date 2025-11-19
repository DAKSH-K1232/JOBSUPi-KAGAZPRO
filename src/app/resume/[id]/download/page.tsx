'use client';

import { useEffect, useState, useRef } from 'react';
import type { ResumeData, ProfileType } from '@/lib/types';
import { useParams } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/language-context';
import { useTranslation } from '@/hooks/use-translation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function ResumePrintContent({ resumeData }: { resumeData: ResumeData }) {
  const { language } = useLanguage();
  const { t } = useTranslation();

  const profileTypeLabels: Record<ProfileType, string> = {
    'white-collar': t('viewer.whiteCollar'),
    'blue-collar': t('viewer.blueCollar'),
    'grey-collar': t('viewer.greyCollar'),
  };

  const { name, email, phone, location, website, summary, photoUrl } = resumeData.personalInfo;
  const profileTypeLabel = profileTypeLabels[resumeData.profileType];

  return (
    <div className={`p-10 text-foreground bg-card ${language === 'hi' ? 'font-hindi' : 'font-body'}`}>
      <header className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary">
          <AvatarImage src={photoUrl || undefined} alt={name} />
          <AvatarFallback><User className="h-16 w-16" /></AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">{name}</h1>
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mt-1">
            <p className="text-lg text-muted-foreground">{resumeData.experience[0]?.role || t('viewer.defaultRole')}</p>
            {profileTypeLabel && <Badge variant="outline">{profileTypeLabel}</Badge>}
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground">
            {email && <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" />{email}</span>}
            {phone && <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" />{phone}</span>}
            {location && <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" />{location}</span>}
            {website && <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary"><Globe className="h-4 w-4 text-accent" />{website}</a>}
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-primary border-b-2 border-primary pb-2 mb-4">{t('viewer.summaryTitle')}</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{summary}</p>
          </section>

          {resumeData.experience && resumeData.experience.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-primary border-b-2 border-primary pb-2 mb-4">{t('viewer.experienceTitle')}</h2>
              <div className="space-y-6">
                {resumeData.experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-lg">{exp.role}</h3>
                      <p className="text-sm text-muted-foreground">{exp.startDate} - {exp.endDate || t('viewer.present')}</p>
                    </div>
                    <p className="text-md text-accent font-medium">{exp.company}</p>
                    <p className="text-muted-foreground mt-2 text-sm whitespace-pre-wrap">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="md:col-span-1 space-y-8">
          {resumeData.skills && resumeData.skills.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-primary border-b-2 border-primary pb-2 mb-4">{t('viewer.skillsTitle')}</h2>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
              </div>
            </section>
          )}

          {(resumeData.skills && resumeData.skills.length > 0 && resumeData.education && resumeData.education.length > 0) && <Separator />}

          {resumeData.education && resumeData.education.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-primary border-b-2 border-primary pb-2 mb-4">{t('viewer.educationTitle')}</h2>
              <div className="space-y-4">
                {resumeData.education.map(edu => (
                  <div key={edu.id}>
                    <h3 className="font-semibold">{edu.institution}</h3>
                    <p className="text-muted-foreground text-sm">{edu.degree}, {edu.fieldOfStudy}</p>
                    <p className="text-muted-foreground text-sm">{t('viewer.graduated')} {edu.graduationYear}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ResumeDownloadPage() {
  const params = useParams();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params.id;
  const { setLanguage } = useLanguage();
  const componentRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `resume-${id}`,
    onAfterPrint: () => window.close(),
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      body {
        -webkit-print-color-adjust: exact;
        background-color: #fff;
      }
    `,
  });

  useEffect(() => {
    if (!id) return;
    try {
      const storedData = localStorage.getItem('kagaz-pro-resume-data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.id === id) {
          setResumeData(parsedData);
          if (parsedData.lang) {
            setLanguage(parsedData.lang);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load resume data", error);
    } finally {
      setLoading(false);
    }
  }, [id, setLanguage]);
  
  useEffect(() => {
    if (resumeData && !loading) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [resumeData, loading, handlePrint]);

  if (loading || !resumeData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 max-w-4xl mx-auto w-full p-8">
            <div className="flex items-center gap-2 text-lg">
                <Skeleton className="h-6 w-6 animate-spin rounded-full" />
                <p>{t('viewer.preparingDownload') || 'Preparing download...'}</p>
            </div>
            <Skeleton className="h-[80vh] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="A4-page" ref={componentRef}>
      <ResumePrintContent resumeData={resumeData} />
    </div>
  );
}

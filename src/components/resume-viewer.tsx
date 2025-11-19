'use client';

import type { ResumeData, ProfileType } from '@/lib/types';
import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, QrCode, Share2, ArrowLeft, Mail, Phone, Link as LinkIcon, MapPin, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useToast } from '@/hooks/use-toast';

const profileTypeLabels: Record<ProfileType, string> = {
  'white-collar': 'White Collar',
  'blue-collar': 'Blue Collar',
  'grey-collar': 'Grey Collar',
};

export function ResumeViewer({ resumeData }: { resumeData: ResumeData }) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // This runs only on the client, so window is available.
    setUrl(window.location.href);
  }, []);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${resumeData.personalInfo.name}-resume`,
    pageStyle: `
      @media print {
        @page {
          size: A4;
          margin: 0;
        }
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `
  });
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied!", description: "The link to your resume is now on your clipboard." });
  };

  const avatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
  const { name, email, phone, location, website, summary } = resumeData.personalInfo;
  const profileTypeLabel = profileTypeLabels[resumeData.profileType];

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Editor
            </Link>
          </Button>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handlePrint}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            {url && (
              <>
                <Button variant="secondary" onClick={handleCopyLink}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary">
                      <QrCode className="mr-2 h-4 w-4" />
                      Show QR Code
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto">
                    <div className="p-4 bg-white rounded-md">
                      <QRCode value={url} size={160} />
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-2">Scan to view profile</p>
                  </PopoverContent>
                </Popover>
              </>
            )}
          </div>
        </div>

        <Card className="max-w-4xl mx-auto shadow-lg overflow-hidden">
          <div ref={componentRef} className="p-6 sm:p-8 md:p-10 text-foreground bg-card font-body">
            <header className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary">
                {avatar && <AvatarImage src={avatar.imageUrl} alt={name} data-ai-hint={avatar.imageHint} />}
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary">{name}</h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mt-1">
                  <p className="text-lg text-muted-foreground">{resumeData.experience[0]?.role || 'Professional'}</p>
                  {profileTypeLabel && <Badge variant="outline">{profileTypeLabel}</Badge>}
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" />{email}</span>
                  <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" />{phone}</span>
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" />{location}</span>
                  {website && <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary"><Globe className="h-4 w-4 text-accent" />{website}</a>}
                </div>
              </div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h2 className="text-xl font-bold text-primary border-b-2 border-primary pb-2 mb-4">Summary</h2>
                  <p className="text-muted-foreground">{summary}</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary border-b-2 border-primary pb-2 mb-4">Work Experience</h2>
                  <div className="space-y-6">
                    {resumeData.experience.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-semibold text-lg">{exp.role}</h3>
                          <p className="text-sm text-muted-foreground">{exp.startDate} - {exp.endDate || 'Present'}</p>
                        </div>
                        <p className="text-md text-accent font-medium">{exp.company}</p>
                        <p className="text-muted-foreground mt-2 text-sm">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="md:col-span-1 space-y-8">
                <section>
                  <h2 className="text-xl font-bold text-primary border-b-2 border-primary pb-2 mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                  </div>
                </section>
                <Separator />
                <section>
                  <h2 className="text-xl font-bold text-primary border-b-2 border-primary pb-2 mb-4">Education</h2>
                  <div className="space-y-4">
                  {resumeData.education.map(edu => (
                    <div key={edu.id}>
                      <h3 className="font-semibold">{edu.institution}</h3>
                      <p className="text-muted-foreground text-sm">{edu.degree}, {edu.fieldOfStudy}</p>
                      <p className="text-muted-foreground text-sm">Graduated {edu.graduationYear}</p>
                    </div>
                  ))}
                  </div>
                </section>
              </div>
            </main>
          </div>
        </Card>
      </div>
    </div>
  );
}

    
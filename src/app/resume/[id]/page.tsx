'use client';

import { useEffect, useState } from 'react';
import type { ResumeData } from '@/lib/types';
import { ResumeViewer } from '@/components/resume-viewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/header';
import { useParams } from 'next/navigation';

export default function ResumePage() {
  const params = useParams();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params.id;

  useEffect(() => {
    if (!id) return;
    try {
      const storedData = localStorage.getItem('kagaz-pro-resume');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // In a real app, we would fetch based on params.id.
        // For this demo, we just use the one in local storage if ID matches.
        if (parsedData.id === id) {
          setResumeData(parsedData);
        }
      }
    } catch (error) {
      console.error("Failed to load resume data from local storage", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto p-8">
                <div className="space-y-4 max-w-4xl mx-auto">
                    <Skeleton className="h-10 w-1/4 mb-4" />
                    <Skeleton className="h-[80vh] w-full" />
                </div>
            </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader>
              <CardTitle>Resume Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The resume you are looking for could not be found or has been removed.
              </p>
              <Button asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Builder
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <ResumeViewer resumeData={resumeData} />;
}

'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Mic, Square, Loader2, Sparkles, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSkillsFromVoice } from '@/app/actions';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { useTranslation } from '@/hooks/use-translation';

interface VoiceSkillImporterProps {
  onSkillsAdded: (skills: string[]) => void;
}

type RecordingStatus = 'idle' | 'recording' | 'processing' | 'success' | 'error';

export function VoiceSkillImporter({ onSkillsAdded }: VoiceSkillImporterProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [inferredSkills, setInferredSkills] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = handleStop;
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setStatus('recording');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: 'destructive',
        title: t('toast.micError.title'),
        description: t('toast.micError.description'),
      });
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      // Stop all audio tracks to turn off the microphone indicator
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setStatus('processing');
    }
  };

  const handleStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      const result = await getSkillsFromVoice(base64Audio);
      if (result.error) {
        toast({ variant: 'destructive', title: t('toast.aiError.title'), description: result.error });
        setStatus('error');
      } else {
        setInferredSkills(result.skills);
        setStatus('success');
        toast({ title: t('toast.skillsInferred.title'), description: t('toast.skillsInferred.description') });
      }
    };
  };

  const handleSkillClick = (skill: string) => {
    onSkillsAdded([skill]);
    setInferredSkills(prev => prev.filter(s => s !== skill));
  };
  
  const reset = () => {
    setStatus('idle');
    setInferredSkills([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {status !== 'recording' ? (
          <Button type="button" onClick={startRecording} disabled={status === 'processing'}>
            {status === 'processing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
            {status === 'processing' ? t('voiceImporter.processing') : t('voiceImporter.startRecording')}
          </Button>
        ) : (
          <Button type="button" onClick={stopRecording} variant="destructive">
            <Square className="mr-2 h-4 w-4" />
            {t('voiceImporter.stopRecording')}
          </Button>
        )}
      </div>

      {status === 'success' && (
        <Card className="bg-primary/5">
          <CardContent className="p-4 space-y-3">
             <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> {t('voiceImporter.aiSuggestedSkills')}</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={reset}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{t('voiceImporter.clickToAdd')}</p>
            {inferredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                {inferredSkills.map(skill => (
                    <Badge
                    key={skill}
                    onClick={() => handleSkillClick(skill)}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                    {skill}
                    </Badge>
                ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">{t('voiceImporter.noSkillsFound')}</p>
            )}
          </CardContent>
        </Card>
      )}
      {status === 'error' && (
         <div className="text-sm text-destructive">
            <p>{t('voiceImporter.error')}</p>
             <Button variant="link" className="p-0 h-auto" onClick={reset}>{t('voiceImporter.tryAgain')}</Button>
         </div>
      )}
    </div>
  );
}

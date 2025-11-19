'use client';

import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, GraduationCap, Plus, Sparkles, Trash2, User, FileText, Send, Keyboard, UserSquare, Upload } from 'lucide-react';
import { VoiceSkillImporter } from './voice-skill-importer';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useState, useRef, ChangeEvent } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useTranslation } from '@/hooks/use-translation';

const resumeSchema = (t: (key: string) => string) => z.object({
  profileType: z.enum(['white-collar', 'blue-collar', 'grey-collar']),
  versionName: z.string(),
  personalInfo: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    website: z.string(),
    summary: z.string(),
    photoUrl: z.string().optional(),
  }),
  experience: z.array(z.object({
    id: z.string(),
    company: z.string(),
    role: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    description: z.string(),
  })),
  education: z.array(z.object({
    id: z.string(),
    institution: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string(),
    graduationYear: z.string(),
  })),
  skills: z.array(z.string()),
  notes: z.string(),
});


type ResumeFormValues = z.infer<ReturnType<typeof resumeSchema>>;

interface ResumeBuilderProps {
  form: UseFormReturn<ResumeFormValues>;
  onSubmit: (data: ResumeFormValues) => void;
}


export function ResumeBuilder({ form, onSubmit }: ResumeBuilderProps) {
  const { t } = useTranslation();
  const [skillInput, setSkillInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: 'experience' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: 'education' });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control: form.control, name: 'skills' });
  
  const profileType = form.watch('profileType');

  const handleSkillsAdded = (newSkills: string[]) => {
    const currentSkills = form.getValues('skills');
    const uniqueNewSkills = newSkills.filter(skill => !currentSkills.includes(skill));
    uniqueNewSkills.forEach(skill => appendSkill(skill));
  };
  
  const handleAddSkillFromInput = () => {
    if (skillInput.trim()) {
      handleSkillsAdded([skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('personalInfo.photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const photoUrl = form.watch('personalInfo.photoUrl');

  const getExperienceLabels = () => {
    switch (profileType) {
      case 'blue-collar':
        return { title: t('builder.blueCollar.expTitle'), description: t('builder.blueCollar.expDescription'), role: t('builder.blueCollar.expRole'), company: t('builder.blueCollar.expCompany') };
      case 'grey-collar':
        return { title: t('builder.greyCollar.expTitle'), description: t('builder.greyCollar.expDescription'), role: t('builder.greyCollar.expRole'), company: t('builder.greyCollar.expCompany') };
      default: // white-collar
        return { title: t('builder.whiteCollar.expTitle'), description: t('builder.whiteCollar.expDescription'), role: t('builder.whiteCollar.expRole'), company: t('builder.whiteCollar.expCompany') };
    }
  };
  const expLabels = getExperienceLabels();

  const getEducationLabels = () => {
    switch (profileType) {
      case 'blue-collar':
        return { title: t('builder.blueCollar.eduTitle'), description: t('builder.blueCollar.eduDescription'), institution: t('builder.blueCollar.eduInstitution'), degree: t('builder.blueCollar.eduDegree') };
      case 'grey-collar':
        return { title: t('builder.greyCollar.eduTitle'), description: t('builder.greyCollar.eduDescription'), institution: t('builder.greyCollar.eduInstitution'), degree: t('builder.greyCollar.eduDegree') };
      default: // white-collar
        return { title: t('builder.whiteCollar.eduTitle'), description: t('builder.whiteCollar.eduDescription'), institution: t('builder.whiteCollar.eduInstitution'), degree: t('builder.whiteCollar.eduDegree') };
    }
  };
  const eduLabels = getEducationLabels();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>{t('builder.versionTitle')}</CardTitle>
              <CardDescription>{t('builder.versionDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="versionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('builder.versionNameLabel')}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserSquare /> {t('builder.profileTypeTitle')}</CardTitle>
              <CardDescription>{t('builder.profileTypeDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
               <FormField
                control={form.control}
                name="profileType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary transition-all">
                          <FormControl>
                            <RadioGroupItem value="white-collar" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            <span className="font-semibold block">{t('builder.whiteCollar.label')}</span>
                            <span className="text-sm text-muted-foreground">{t('builder.whiteCollar.description')}</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary transition-all">
                          <FormControl>
                            <RadioGroupItem value="blue-collar" />
                          </FormControl>
                          <FormLabel className="font-normal">
                             <span className="font-semibold block">{t('builder.blueCollar.label')}</span>
                            <span className="text-sm text-muted-foreground">{t('builder.blueCollar.description')}</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary transition-all">
                          <FormControl>
                            <RadioGroupItem value="grey-collar" />
                          </FormControl>
                          <FormLabel className="font-normal">
                             <span className="font-semibold block">{t('builder.greyCollar.label')}</span>
                            <span className="text-sm text-muted-foreground">{t('builder.greyCollar.description')}</span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User /> {t('builder.personalInfoTitle')}</CardTitle>
              <CardDescription>{t('builder.personalInfoDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                  control={form.control}
                  name="personalInfo.photoUrl"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={photoUrl} />
                        <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                      </Avatar>
                      <div className="grid gap-2">
                        <FormLabel>{t('builder.photoLabel')}</FormLabel>
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handlePhotoUpload}
                        />
                        <Button type="button" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          {t('builder.photoUploadButton')}
                        </Button>
                        <FormDescription>{t('builder.photoDescription')}</FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="personalInfo.name" render={({ field }) => <FormItem><FormLabel>{t('builder.nameLabel')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="personalInfo.email" render={({ field }) => <FormItem><FormLabel>{t('builder.emailLabel')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="personalInfo.phone" render={({ field }) => <FormItem><FormLabel>{t('builder.phoneLabel')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="personalInfo.location" render={({ field }) => <FormItem><FormLabel>{t('builder.locationLabel')}</FormLabel><FormControl><Input placeholder={t('builder.locationPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>
              {profileType !== 'blue-collar' && (
                <FormField control={form.control} name="personalInfo.website" render={({ field }) => <FormItem><FormLabel>{t('builder.websiteLabel')}</FormLabel><FormControl><Input placeholder="https://yourportfolio.com" {...field} /></FormControl><FormMessage /></FormItem>} />
              )}
              <FormField control={form.control} name="personalInfo.summary" render={({ field }) => <FormItem><FormLabel>{t('builder.summaryLabel')}</FormLabel><FormControl><Textarea placeholder={t('builder.summaryPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>} />
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase /> {expLabels.title}</CardTitle>
              <CardDescription>{expLabels.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {expFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg relative space-y-4 animate-fade-in">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExp(index)}><Trash2 className="h-4 w-4" /></Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`experience.${index}.role`} render={({ field }) => <FormItem><FormLabel>{expLabels.role}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => <FormItem><FormLabel>{expLabels.company}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`experience.${index}.startDate`} render={({ field }) => <FormItem><FormLabel>{t('builder.startDateLabel')}</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`experience.${index}.endDate`} render={({ field }) => <FormItem><FormLabel>{t('builder.endDateLabel')}</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>} />
                  </div>
                  <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => <FormItem><FormLabel>{t('builder.descriptionLabel')}</FormLabel><FormControl><Textarea placeholder={t('builder.descriptionPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendExp({ id: uuidv4(), company: '', role: '', startDate: '', endDate: '', description: '' })}><Plus className="mr-2 h-4 w-4" /> {t('builder.addExperienceButton')}</Button>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap /> {eduLabels.title}</CardTitle>
              <CardDescription>{eduLabels.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {eduFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg relative space-y-4 animate-fade-in">
                   <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEdu(index)}><Trash2 className="h-4 w-4" /></Button>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => <FormItem><FormLabel>{eduLabels.institution}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => <FormItem><FormLabel>{eduLabels.degree}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`education.${index}.fieldOfStudy`} render={({ field }) => <FormItem><FormLabel>{t('builder.fieldOfStudyLabel')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`education.${index}.graduationYear`} render={({ field }) => <FormItem><FormLabel>{t('builder.graduationYearLabel')}</FormLabel><FormControl><Input type="number" placeholder="YYYY" {...field} /></FormControl><FormMessage /></FormItem>} />
                   </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendEdu({ id: uuidv4(), institution: '', degree: '', fieldOfStudy: '', graduationYear: '' })}><Plus className="mr-2 h-4 w-4" /> {t('builder.addEducationButton')}</Button>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles /> {t('builder.skillsTitle')}</CardTitle>
              <CardDescription>{t('builder.skillsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                 <Keyboard className="h-5 w-5 text-muted-foreground" />
                 <Input
                  type="text"
                  placeholder={t('builder.skillInputPlaceholder')}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkillFromInput();
                    }
                  }}
                  className="flex-grow"
                />
                <Button type="button" onClick={handleAddSkillFromInput}>{t('builder.addSkillButton')}</Button>
              </div>
              <Separator />
              <VoiceSkillImporter onSkillsAdded={handleSkillsAdded} />
              <Separator />
              <div className="space-y-2">
                <FormLabel>{t('builder.yourSkillsLabel')}</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {skillFields.map((field, index) => (
                    <Badge key={field.id} variant="secondary" className="text-sm py-1 pl-3 pr-2 animate-fade-in">
                      {form.getValues(`skills.${index}`)}
                      <button type="button" onClick={() => removeSkill(index)} className="ml-1 rounded-full hover:bg-destructive/20 p-0.5">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {skillFields.length === 0 && <p className="text-sm text-muted-foreground">{t('builder.noSkillsMessage')}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText /> {t('builder.notesTitle')}</CardTitle>
                <CardDescription>{t('builder.notesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField control={form.control} name="notes" render={({ field }) => <FormItem><FormControl><Textarea placeholder={t('builder.notesPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>} />
            </CardContent>
          </Card>
          
          {form.formState.errors.root && (
            <div className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</div>
          )}

          <div className="flex justify-end sticky bottom-0 py-4 bg-background/90 backdrop-blur-sm z-10">
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? t('builder.submittingButton') : t('builder.submitButton')}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

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


const resumeSchema = z.object({
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


type ResumeFormValues = z.infer<typeof resumeSchema>;

interface ResumeBuilderProps {
  form: UseFormReturn<ResumeFormValues>;
  onSubmit: (data: ResumeFormValues) => void;
}


export function ResumeBuilder({ form, onSubmit }: ResumeBuilderProps) {
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
        return { title: 'Work History', description: 'List your previous jobs.', role: 'Job Title', company: 'Employer' };
      case 'grey-collar':
        return { title: 'Work Experience', description: 'Detail your technical and professional roles.', role: 'Role / Title', company: 'Company / Client' };
      default: // white-collar
        return { title: 'Work Experience', description: 'Detail your professional journey.', role: 'Role', company: 'Company' };
    }
  };
  const expLabels = getExperienceLabels();

  const getEducationLabels = () => {
    switch (profileType) {
      case 'blue-collar':
        return { title: 'Education & Certifications', description: 'List your training, certifications, and formal education.', institution: 'School / Provider', degree: 'Certificate / Degree' };
      case 'grey-collar':
        return { title: 'Education & Specialized Training', description: 'Your academic and technical qualifications.', institution: 'Institution', degree: 'Degree / Certification' };
      default: // white-collar
        return { title: 'Education', description: 'Your academic background.', institution: 'Institution', degree: 'Degree' };
    }
  };
  const eduLabels = getEducationLabels();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>Resume Version</CardTitle>
              <CardDescription>Give this version of your resume a name to identify it later.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="versionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserSquare /> Profile Type</CardTitle>
              <CardDescription>Select the category that best describes your line of work. This will tailor the fields for you.</CardDescription>
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
                            <span className="font-semibold block">White Collar</span>
                            <span className="text-sm text-muted-foreground">Office, administrative, or professional jobs.</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary transition-all">
                          <FormControl>
                            <RadioGroupItem value="blue-collar" />
                          </FormControl>
                          <FormLabel className="font-normal">
                             <span className="font-semibold block">Blue Collar</span>
                            <span className="text-sm text-muted-foreground">Manual labor or skilled trade jobs.</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary transition-all">
                          <FormControl>
                            <RadioGroupItem value="grey-collar" />
                          </FormControl>
                          <FormLabel className="font-normal">
                             <span className="font-semibold block">Grey Collar</span>
                            <span className="text-sm text-muted-foreground">Technicians or specialized roles.</span>
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
              <CardTitle className="flex items-center gap-2"><User /> Personal Information</CardTitle>
              <CardDescription>Let's start with the basics.</CardDescription>
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
                        <FormLabel>Profile Photo</FormLabel>
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handlePhotoUpload}
                        />
                        <Button type="button" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </Button>
                        <FormDescription>Recommended size: 400x400px.</FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="personalInfo.name" render={({ field }) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="personalInfo.email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="personalInfo.phone" render={({ field }) => <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="personalInfo.location" render={({ field }) => <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Mumbai, India" {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>
              {profileType !== 'blue-collar' && (
                <FormField control={form.control} name="personalInfo.website" render={({ field }) => <FormItem><FormLabel>Website/Portfolio (Optional)</FormLabel><FormControl><Input placeholder="https://yourportfolio.com" {...field} /></FormControl><FormMessage /></FormItem>} />
              )}
              <FormField control={form.control} name="personalInfo.summary" render={({ field }) => <FormItem><FormLabel>Professional Summary</FormLabel><FormControl><Textarea placeholder="A brief summary of your career and goals." {...field} /></FormControl><FormMessage /></FormItem>} />
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
                    <FormField control={form.control} name={`experience.${index}.startDate`} render={({ field }) => <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`experience.${index}.endDate`} render={({ field }) => <FormItem><FormLabel>End Date (leave blank if current)</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>} />
                  </div>
                  <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your responsibilities and achievements." {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendExp({ id: uuidv4(), company: '', role: '', startDate: '', endDate: '', description: '' })}><Plus className="mr-2 h-4 w-4" /> Add Experience</Button>
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
                    <FormField control={form.control} name={`education.${index}.fieldOfStudy`} render={({ field }) => <FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`education.${index}.graduationYear`} render={({ field }) => <FormItem><FormLabel>Graduation Year</FormLabel><FormControl><Input type="number" placeholder="YYYY" {...field} /></FormControl><FormMessage /></FormItem>} />
                   </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendEdu({ id: uuidv4(), institution: '', degree: '', fieldOfStudy: '', graduationYear: '' })}><Plus className="mr-2 h-4 w-4" /> Add Education</Button>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles /> Skills</CardTitle>
              <CardDescription>List your skills manually or use AI to infer them from your voice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                 <Keyboard className="h-5 w-5 text-muted-foreground" />
                 <Input
                  type="text"
                  placeholder="Enter a skill and press Add"
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
                <Button type="button" onClick={handleAddSkillFromInput}>Add Skill</Button>
              </div>
              <Separator />
              <VoiceSkillImporter onSkillsAdded={handleSkillsAdded} />
              <Separator />
              <div className="space-y-2">
                <FormLabel>Your Skills</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {skillFields.map((field, index) => (
                    <Badge key={field.id} variant="secondary" className="text-sm py-1 pl-3 pr-2 animate-fade-in">
                      {form.getValues(`skills.${index}`)}
                      <button type="button" onClick={() => removeSkill(index)} className="ml-1 rounded-full hover:bg-destructive/20 p-0.5">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {skillFields.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet.</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText /> Notes</CardTitle>
                <CardDescription>Add personal notes or feedback received. This won't appear on the final resume.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField control={form.control} name="notes" render={({ field }) => <FormItem><FormControl><Textarea placeholder="e.g., 'Tailor this for marketing roles...'" {...field} /></FormControl><FormMessage /></FormItem>} />
            </CardContent>
          </Card>
          
          {form.formState.errors.root && (
            <div className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</div>
          )}

          <div className="flex justify-end sticky bottom-0 py-4 bg-background/90 backdrop-blur-sm z-10">
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Generating...' : 'Save & Get Shareable Link'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

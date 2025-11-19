'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, GraduationCap, Plus, Sparkles, Trash2, User, FileText, Send, Keyboard, UserSquare } from 'lucide-react';
import { VoiceSkillImporter } from './voice-skill-importer';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

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

type ResumeFormValues = z.infer<typeof resumeSchema>;

export function ResumeBuilder() {
  const router = useRouter();
  const [skillInput, setSkillInput] = useState('');

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      profileType: 'white-collar',
      versionName: 'My First Resume',
      personalInfo: { name: '', email: '', phone: '', location: '', website: '', summary: '' },
      experience: [],
      education: [],
      skills: [],
      notes: '',
    },
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: 'experience' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: 'education' });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control: form.control, name: 'skills' });

  const onSubmit = (data: ResumeFormValues) => {
    const resumeId = uuidv4();
    const fullResumeData = { ...data, id: resumeId };
    try {
      localStorage.setItem('kagaz-pro-resume', JSON.stringify(fullResumeData));
      router.push(`/resume/${resumeId}`);
    } catch (error) {
      console.error("Failed to save resume to local storage", error);
      form.setError('root', { type: 'manual', message: 'Could not save resume. Your browser storage might be full.' });
    }
  };

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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserSquare /> Profile Type</CardTitle>
              <CardDescription>Select the category that best describes your line of work.</CardDescription>
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
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="white-collar" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            <span className="font-semibold block">White Collar</span>
                            <span className="text-sm text-muted-foreground">Office, administrative, or professional jobs.</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="blue-collar" />
                          </FormControl>
                          <FormLabel className="font-normal">
                             <span className="font-semibold block">Blue Collar</span>
                            <span className="text-sm text-muted-foreground">Manual labor or skilled trade jobs.</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User /> Personal Information</CardTitle>
              <CardDescription>Let's start with the basics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="personalInfo.name" render={({ field }) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="personalInfo.email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="personalInfo.phone" render={({ field }) => <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="personalInfo.location" render={({ field }) => <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Mumbai, India" {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>
              <FormField control={form.control} name="personalInfo.website" render={({ field }) => <FormItem><FormLabel>Website/Portfolio (Optional)</FormLabel><FormControl><Input placeholder="https://yourportfolio.com" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="personalInfo.summary" render={({ field }) => <FormItem><FormLabel>Professional Summary</FormLabel><FormControl><Textarea placeholder="A brief summary of your career and goals." {...field} /></FormControl><FormMessage /></FormItem>} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase /> Work Experience</CardTitle>
              <CardDescription>Detail your professional journey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {expFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExp(index)}><Trash2 className="h-4 w-4" /></Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`experience.${index}.role`} render={({ field }) => <FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`experience.${index}.startDate`} render={({ field }) => <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`experience.${index}.endDate`} render={({ field }) => <FormItem><FormLabel>End Date (leave blank if current)</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>} />
                  </div>
                  <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your responsibilities and achievements." {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendExp({ id: uuidv4(), company: '', role: '', startDate: '', endDate: '', description: '' })}><Plus className="mr-2 h-4 w-4" /> Add Experience</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap /> Education</CardTitle>
              <CardDescription>Your academic background.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {eduFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                   <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEdu(index)}><Trash2 className="h-4 w-4" /></Button>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => <FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => <FormItem><FormLabel>Degree</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`education.${index}.fieldOfStudy`} render={({ field }) => <FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name={`education.${index}.graduationYear`} render={({ field }) => <FormItem><FormLabel>Graduation Year</FormLabel><FormControl><Input type="number" placeholder="YYYY" {...field} /></FormControl><FormMessage /></FormItem>} />
                   </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendEdu({ id: uuidv4(), institution: '', degree: '', fieldOfStudy: '', graduationYear: '' })}><Plus className="mr-2 h-4 w-4" /> Add Education</Button>
            </CardContent>
          </Card>
          
          <Card>
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
                    <Badge key={field.id} variant="secondary" className="text-sm py-1 pl-3 pr-2">
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
          
          <Card>
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

          <div className="flex justify-end sticky bottom-0 py-4 bg-background/90 backdrop-blur-sm">
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Generating...' : 'Preview & Share'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

    
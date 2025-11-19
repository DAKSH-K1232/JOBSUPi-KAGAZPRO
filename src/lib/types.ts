export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
}

export interface ResumeData {
  id: string;
  versionName: string;
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  notes: string;
}

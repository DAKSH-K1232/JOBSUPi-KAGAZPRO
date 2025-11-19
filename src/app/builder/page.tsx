import { Header } from '@/components/header';
import { ResumeBuilder } from '@/components/resume-builder';

export default function BuilderPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <ResumeBuilder />
      </main>
    </div>
  );
}

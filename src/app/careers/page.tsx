import Link from 'next/link';
import Image from 'next/image';

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

// Sample job positions
const jobPositions: JobPosition[] = [
  {
    id: 'fe-dev-1',
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Mumbai, India (Remote)',
    type: 'Full-time',
    description: 'We\'re looking for a passionate Frontend Developer to join our team and help build beautiful, responsive user interfaces for our event booking platform.',
  },
  {
    id: 'be-dev-1',
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Delhi, India (Remote)',
    type: 'Full-time',
    description: 'Join our engineering team to develop and maintain scalable backend services for our growing event platform.',
  },
  {
    id: 'pm-1',
    title: 'Product Manager',
    department: 'Product',
    location: 'Bangalore, India (Hybrid)',
    type: 'Full-time',
    description: 'We\'re seeking an experienced Product Manager to lead our product development efforts and drive our event platform forward.',
  },
  {
    id: 'devops-1',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Any location in India (Remote)',
    type: 'Full-time',
    description: 'Help us build and maintain our cloud infrastructure, CI/CD pipelines, and ensure our platform runs smoothly and securely.',
  },
  {
    id: 'cs-1',
    title: 'Customer Support Specialist',
    department: 'Support',
    location: 'Any location in India (Remote)',
    type: 'Full-time',
    description: 'Join our customer support team to help event organizers and attendees have a seamless experience with our platform.',
  },
];

// Job Card Component
function JobCard({ job }: { job: JobPosition }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {job.department}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
            {job.location}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            {job.type}
          </span>
        </div>
        <p className="mt-3 text-gray-600">{job.description}</p>
        <div className="mt-4">
          <Link 
            href={`/careers/${job.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CareersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're building the future of event booking in India. Join us in our mission to connect people through meaningful events and experiences.
        </p>
      </div>
      
      {/* Company Culture Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Work With Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Attractive Benefits</h3>
            <p className="text-gray-600">Competitive salary, health insurance, flexible working hours, and generous leave policy.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Growth Opportunities</h3>
            <p className="text-gray-600">Learn and grow with a rapidly expanding startup. Clear career progression paths and mentorship.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Inclusive Culture</h3>
            <p className="text-gray-600">We value diversity and inclusion. Join a team that respects your unique perspective and contributions.</p>
          </div>
        </div>
      </div>
      
      {/* Open Positions Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
        
        {jobPositions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobPositions.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No open positions at the moment</h3>
            <p className="text-gray-600 mb-4">
              We don't have any open roles right now, but we're always looking for talented people.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Contact Us
            </Link>
          </div>
        )}
      </div>
      
      {/* Application Process */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Application Process</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-bold">1</span>
              </div>
              <h3 className="font-medium">Application</h3>
              <p className="text-sm text-gray-600 mt-1">Submit your resume and cover letter</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-bold">2</span>
              </div>
              <h3 className="font-medium">Initial Interview</h3>
              <p className="text-sm text-gray-600 mt-1">Video call with our HR team</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-bold">3</span>
              </div>
              <h3 className="font-medium">Technical Assessment</h3>
              <p className="text-sm text-gray-600 mt-1">Role-specific skills evaluation</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-bold">4</span>
              </div>
              <h3 className="font-medium">Final Interview</h3>
              <p className="text-sm text-gray-600 mt-1">Meet the team and discuss next steps</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact CTA */}
      <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Don't see a role that fits?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          We're always looking for talented individuals to join our team. Send us your resume and we'll keep it on file for future opportunities.
        </p>
        <Link
          href="mailto:careers@example.com"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Contact Our HR Team
        </Link>
      </div>
    </div>
  );
} 
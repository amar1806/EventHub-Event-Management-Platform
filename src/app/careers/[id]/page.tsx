"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Sample job data - in a real app, this would come from an API or database
const jobPositions = [
  {
    id: 'fe-dev-1',
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Mumbai, India (Remote)',
    type: 'Full-time',
    description: 'We\'re looking for a passionate Frontend Developer to join our team and help build beautiful, responsive user interfaces for our event booking platform.',
    responsibilities: [
      'Design and implement user-facing features in our web application',
      'Build reusable components and libraries for future use',
      'Optimize applications for maximum speed and scalability',
      'Collaborate with back-end developers and designers',
      'Ensure the technical feasibility of UI/UX designs',
    ],
    requirements: [
      '3+ years experience with React.js and modern frontend frameworks',
      'Proficiency in HTML5, CSS3, and JavaScript (ES6+)',
      'Experience with responsive design and cross-browser compatibility',
      'Familiarity with RESTful APIs and modern frontend build pipelines',
      'Knowledge of Next.js, TypeScript, and Tailwind CSS is a plus',
    ],
    salary: '₹10-18 LPA, based on experience',
    postedDate: '2023-11-15',
  },
  {
    id: 'be-dev-1',
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Delhi, India (Remote)',
    type: 'Full-time',
    description: 'Join our engineering team to develop and maintain scalable backend services for our growing event platform.',
    responsibilities: [
      'Design and build scalable APIs and services',
      'Implement security and data protection measures',
      'Integrate with third-party services and external APIs',
      'Monitor and optimize application performance',
      'Work closely with frontend developers to integrate user-facing elements',
    ],
    requirements: [
      '3+ years experience in backend development with Node.js',
      'Strong knowledge of database design and ORM technologies',
      'Experience with microservices architecture',
      'Familiarity with cloud services (AWS, Azure, or GCP)',
      'Knowledge of Docker, Kubernetes, and CI/CD pipelines is a plus',
    ],
    salary: '₹12-20 LPA, based on experience',
    postedDate: '2023-11-10',
  },
  {
    id: 'pm-1',
    title: 'Product Manager',
    department: 'Product',
    location: 'Bangalore, India (Hybrid)',
    type: 'Full-time',
    description: 'We\'re seeking an experienced Product Manager to lead our product development efforts and drive our event platform forward.',
    responsibilities: [
      'Define product vision, strategy, and roadmap',
      'Gather and prioritize product requirements',
      'Work closely with engineering, design, and marketing teams',
      'Analyze market trends and competitive landscape',
      'Define success metrics and monitor product performance',
    ],
    requirements: [
      '4+ years of product management experience',
      'Strong analytical and problem-solving skills',
      'Excellent communication and stakeholder management abilities',
      'Experience with agile development methodologies',
      'Background in consumer-facing digital products or marketplaces is a plus',
    ],
    salary: '₹18-30 LPA, based on experience',
    postedDate: '2023-10-30',
  },
  {
    id: 'devops-1',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Any location in India (Remote)',
    type: 'Full-time',
    description: 'Help us build and maintain our cloud infrastructure, CI/CD pipelines, and ensure our platform runs smoothly and securely.',
    responsibilities: [
      'Implement and maintain CI/CD pipelines',
      'Manage cloud infrastructure and deployment strategies',
      'Ensure system reliability, scalability, and security',
      'Monitor system performance and troubleshoot issues',
      'Collaborate with development teams to improve development workflows',
    ],
    requirements: [
      '3+ years experience in DevOps or Site Reliability Engineering',
      'Strong knowledge of cloud services (AWS, Azure, or GCP)',
      'Experience with containerization (Docker) and orchestration (Kubernetes)',
      'Familiarity with infrastructure as code (Terraform, CloudFormation)',
      'Knowledge of monitoring and logging systems',
    ],
    salary: '₹14-24 LPA, based on experience',
    postedDate: '2023-11-05',
  },
  {
    id: 'cs-1',
    title: 'Customer Support Specialist',
    department: 'Support',
    location: 'Any location in India (Remote)',
    type: 'Full-time',
    description: 'Join our customer support team to help event organizers and attendees have a seamless experience with our platform.',
    responsibilities: [
      'Respond to customer inquiries via email, chat, and phone',
      'Troubleshoot and resolve customer issues',
      'Document common problems and solutions',
      'Provide feedback to product and engineering teams',
      'Help create and maintain support documentation',
    ],
    requirements: [
      '2+ years of customer support experience',
      'Excellent communication and interpersonal skills',
      'Problem-solving mindset and ability to work independently',
      'Experience with helpdesk or customer support software',
      'Passion for helping customers and delivering excellent service',
    ],
    salary: '₹5-8 LPA, based on experience',
    postedDate: '2023-11-08',
  },
];

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call to fetch job details
    const jobId = Array.isArray(id) ? id[0] : id;
    const foundJob = jobPositions.find(j => j.id === jobId);
    
    if (foundJob) {
      setJob(foundJob);
    }
    setLoading(false);
  }, [id]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
        <p className="text-gray-600 mb-8">The job position you're looking for doesn't exist or has been removed.</p>
        <Link 
          href="/careers"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View All Openings
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex text-sm">
          <li>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
          </li>
          <li className="mx-2 text-gray-500">/</li>
          <li>
            <Link href="/careers" className="text-blue-600 hover:text-blue-800">
              Careers
            </Link>
          </li>
          <li className="mx-2 text-gray-500">/</li>
          <li className="text-gray-700 truncate">{job.title}</li>
        </ol>
      </nav>
      
      {/* Job Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
          <div className="mt-2 md:mt-0">
            <span className="inline-flex rounded-md shadow-sm">
              <a 
                href="#apply"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apply Now
              </a>
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {job.department}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
            {job.location}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            {job.type}
          </span>
        </div>
        
        <div className="text-sm text-gray-500">
          Posted on {formatDate(job.postedDate)}
        </div>
      </div>
      
      {/* Job Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Job Details</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">About the Role</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.description}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.department}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.location}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Employment Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.type}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Salary Range</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.salary}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Responsibilities */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Responsibilities</h2>
        <ul className="list-disc pl-5 space-y-2">
          {job.responsibilities.map((item: string, index: number) => (
            <li key={index} className="text-gray-700">{item}</li>
          ))}
        </ul>
      </div>
      
      {/* Requirements */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
        <ul className="list-disc pl-5 space-y-2">
          {job.requirements.map((item: string, index: number) => (
            <li key={index} className="text-gray-700">{item}</li>
          ))}
        </ul>
      </div>
      
      {/* Application Form */}
      <div id="apply" className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for this Position</h2>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">First name</label>
              <input
                type="text"
                name="first-name"
                id="first-name"
                autoComplete="given-name"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">Last name</label>
              <input
                type="text"
                name="last-name"
                id="last-name"
                autoComplete="family-name"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone number</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                autoComplete="tel"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700">Resume/CV</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="cover-letter" className="block text-sm font-medium text-gray-700">Cover Letter</label>
            <div className="mt-1">
              <textarea
                id="cover-letter"
                name="cover-letter"
                rows={4}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder="Tell us why you're a great fit for this role"
              ></textarea>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-gray-700">I agree to the privacy policy</label>
              <p className="text-gray-500">
                By submitting this application, you agree to our{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                  privacy policy
                </Link>
                .
              </p>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
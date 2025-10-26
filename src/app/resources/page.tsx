import Link from 'next/link';
import Image from 'next/image';

interface ResourceCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  resources: Resource[];
}

interface Resource {
  title: string;
  description: string;
  type: 'PDF' | 'DOC' | 'XLS' | 'VIDEO' | 'GUIDE';
  link: string;
  size?: string;
}

// Resource categories with their respective resources
const resourceCategories: ResourceCategory[] = [
  {
    title: 'For Event Organizers',
    description: 'Essential resources to help you plan and manage successful events',
    icon: (
      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    resources: [
      {
        title: 'Event Planning Checklist',
        description: 'A comprehensive checklist to ensure you don\'t miss any detail when planning your event',
        type: 'PDF',
        link: '/downloads/event-planning-checklist.pdf',
        size: '842 KB'
      },
      {
        title: 'Budget Template',
        description: 'Track your event expenses and revenue with this easy-to-use Excel template',
        type: 'XLS',
        link: '/downloads/event-budget-template.xlsx',
        size: '1.2 MB'
      },
      {
        title: 'Marketing Timeline Template',
        description: 'Plan your event promotion with this detailed marketing timeline',
        type: 'DOC',
        link: '/downloads/marketing-timeline.docx',
        size: '756 KB'
      },
      {
        title: 'Venue Selection Guide',
        description: 'Learn how to choose the perfect venue for your event type and audience',
        type: 'GUIDE',
        link: '/guides/venue-selection'
      }
    ]
  },
  {
    title: 'Marketing & Promotion',
    description: 'Resources to help you promote your events and reach your target audience',
    icon: (
      <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    resources: [
      {
        title: 'Social Media Toolkit',
        description: 'Templates and guidelines for promoting your event on social media platforms',
        type: 'PDF',
        link: '/downloads/social-media-toolkit.pdf',
        size: '2.1 MB'
      },
      {
        title: 'Email Marketing Templates',
        description: 'Ready-to-use email templates for event announcements, reminders, and follow-ups',
        type: 'DOC',
        link: '/downloads/email-templates.docx',
        size: '945 KB'
      },
      {
        title: 'Content Calendar Template',
        description: 'Plan your event content strategy with this comprehensive calendar template',
        type: 'XLS',
        link: '/downloads/content-calendar.xlsx',
        size: '820 KB'
      },
      {
        title: 'Video: Effective Event Promotion Strategies',
        description: 'Learn proven strategies to maximize your event attendance',
        type: 'VIDEO',
        link: '/videos/event-promotion-strategies'
      }
    ]
  },
  {
    title: 'Attendee Experience',
    description: 'Resources to help you create memorable experiences for your event attendees',
    icon: (
      <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    resources: [
      {
        title: 'Event App Guide',
        description: 'Tips for using our event app to enhance attendee engagement',
        type: 'GUIDE',
        link: '/guides/event-app'
      },
      {
        title: 'Attendee Feedback Survey Template',
        description: 'Collect valuable feedback from your event attendees',
        type: 'DOC',
        link: '/downloads/feedback-survey.docx',
        size: '653 KB'
      },
      {
        title: 'Engagement Activities Guide',
        description: 'Creative ideas for keeping attendees engaged during your event',
        type: 'PDF',
        link: '/downloads/engagement-activities.pdf',
        size: '1.4 MB'
      },
      {
        title: 'Accessibility Checklist',
        description: 'Ensure your event is accessible to attendees with disabilities',
        type: 'PDF',
        link: '/downloads/accessibility-checklist.pdf',
        size: '782 KB'
      }
    ]
  },
  {
    title: 'Technology & Tools',
    description: 'Technical resources to help you make the most of our platform and integrate with other tools',
    icon: (
      <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    resources: [
      {
        title: 'API Documentation',
        description: 'Complete documentation for integrating with our event platform API',
        type: 'GUIDE',
        link: '/api-docs'
      },
      {
        title: 'QR Code Generator Tool',
        description: 'Create custom QR codes for your event check-ins and materials',
        type: 'GUIDE',
        link: '/tools/qr-generator'
      },
      {
        title: 'Event Tech Stack Guide',
        description: 'Recommended technology solutions for different types of events',
        type: 'PDF',
        link: '/downloads/event-tech-guide.pdf',
        size: '1.7 MB'
      },
      {
        title: 'Video: Platform Walkthrough',
        description: 'A comprehensive tour of our event platform features',
        type: 'VIDEO',
        link: '/videos/platform-walkthrough'
      }
    ]
  }
];

// Resource Card Component
function ResourceCard({ resource }: { resource: Resource }) {
  // Function to determine icon based on resource type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return (
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'DOC':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'XLS':
        return (
          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
          </svg>
        );
      case 'VIDEO':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <Link href={resource.link} className="block p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            {getTypeIcon(resource.type)}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{resource.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
            <div className="flex items-center">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800 mr-2">
                {resource.type}
              </span>
              {resource.size && (
                <span className="text-xs text-gray-500">{resource.size}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// Category Section Component
function CategorySection({ category }: { category: ResourceCategory }) {
  return (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <div className="mr-4">{category.icon}</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
          <p className="text-gray-600">{category.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {category.resources.map((resource, index) => (
          <ResourceCard key={index} resource={resource} />
        ))}
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">EventHub Resources</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Access tools, templates, and guides to help you create successful events and enhance your attendee experience.
        </p>
      </div>
      
      {/* Resource Categories */}
      {resourceCategories.map((category, index) => (
        <CategorySection key={index} category={category} />
      ))}
      
      {/* CTA Section */}
      <div className="bg-blue-50 rounded-lg p-8 text-center mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Need Custom Resources?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Our team can help create personalized resources for your specific event needs. Contact us for custom solutions.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Contact Our Team
        </Link>
      </div>
    </div>
  );
} 
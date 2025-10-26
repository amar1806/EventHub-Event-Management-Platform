import Link from 'next/link';
import Image from 'next/image';

interface FaqItem {
  question: string;
  answer: string;
}

// FAQ Categories and their questions
const faqCategories = [
  {
    title: 'General',
    items: [
      {
        question: 'What is EventHub?',
        answer: 'EventHub is a platform that connects event organizers with attendees. We make it easy to discover, create, and manage events of all sizes.'
      },
      {
        question: 'How do I create an account?',
        answer: 'Click on "Sign up" in the top right corner of the page. You can register using your email or social login options. Follow the steps to complete your profile.'
      },
      {
        question: 'Is EventHub free to use?',
        answer: 'EventHub is free for attendees. Organizers pay a small service fee for each ticket sold through our platform.'
      },
      {
        question: 'What types of events can I find on EventHub?',
        answer: 'You can find a wide variety of events including conferences, workshops, concerts, cultural events, tech meetups, and more.'
      }
    ]
  },
  {
    title: 'For Attendees',
    items: [
      {
        question: 'How do I purchase tickets?',
        answer: 'Browse events, select the one you want to attend, click "Register Now", select your ticket type and quantity, then proceed to checkout. You can pay using credit/debit cards or UPI.'
      },
      {
        question: 'Can I get a refund if I can\'t attend an event?',
        answer: 'Refund policies are set by event organizers. Check the specific event details for refund information. You can request refunds from your dashboard under "My Tickets".'
      },
      {
        question: 'How do I access my tickets?',
        answer: 'Your tickets will be emailed to you and also available in your EventHub account under "My Tickets". You can print them or show the digital version at the event.'
      },
      {
        question: 'Can I transfer my ticket to someone else?',
        answer: 'Yes, you can transfer tickets to another attendee from your dashboard. Go to "My Tickets", select the ticket, and click on "Transfer Ticket".'
      }
    ]
  },
  {
    title: 'For Organizers',
    items: [
      {
        question: 'How do I create an event?',
        answer: 'Login to your organizer account, go to your dashboard, and click "Create Event". Fill in the event details including title, description, location, date, time, and ticket information.'
      },
      {
        question: 'How do payouts work?',
        answer: 'Event proceeds are transferred to your registered bank account 7 days after your event is completed. You can view your payment history in your organizer dashboard.'
      },
      {
        question: 'Can I customize my event page?',
        answer: 'Yes, you can add a custom banner image, detailed description, FAQs, and customize ticket types to make your event page stand out.'
      },
      {
        question: 'How do I track ticket sales?',
        answer: 'Your organizer dashboard provides real-time analytics on ticket sales, attendee information, and revenue. You can also export this data as CSV or PDF.'
      }
    ]
  },
  {
    title: 'Technical Issues',
    items: [
      {
        question: 'I didn\'t receive my ticket email. What should I do?',
        answer: 'First, check your spam folder. If you still can\'t find it, login to your EventHub account where all your tickets are stored. If you need further assistance, contact our support team.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click on "Login", then "Forgot password". Enter your email address, and we\'ll send you instructions to reset your password.'
      },
      {
        question: 'The website is not working properly. What should I do?',
        answer: 'Try clearing your browser cache or using a different browser. If issues persist, please contact our support team with details of the problem and screenshots if possible.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard encryption to protect your payment information. We don\'t store your credit card details on our servers.'
      }
    ]
  }
];

// User Guide Links
const userGuides = [
  {
    title: 'Getting Started with EventHub',
    description: 'Learn the basics of using our platform',
    link: '/help/guides/getting-started',
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    title: 'Organizing Your First Event',
    description: 'Step-by-step guide for event creators',
    link: '/help/guides/creating-events',
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: 'Managing Tickets',
    description: 'How to purchase, transfer, and refund tickets',
    link: '/help/guides/managing-tickets',
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    )
  },
  {
    title: 'Payments and Refunds',
    description: 'Understanding our payment system',
    link: '/help/guides/payments',
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    )
  }
];

// FAQ Item Component
function FaqItem({ item }: { item: FaqItem }) {
  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{item.question}</h3>
      <p className="text-gray-600">{item.answer}</p>
    </div>
  );
}

// Guide Card Component
function GuideCard({ guide }: { guide: any }) {
  return (
    <Link 
      href={guide.link}
      className="flex items-start p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex-shrink-0 mr-4">
        {guide.icon}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900">{guide.title}</h3>
        <p className="mt-1 text-gray-600">{guide.description}</p>
      </div>
    </Link>
  );
}

export default function HelpPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">How Can We Help?</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Find answers to common questions or contact our support team for assistance.
        </p>
        <div className="mt-8 max-w-xl mx-auto">
          <div className="flex shadow-sm rounded-md">
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-l-md border-gray-300 p-4"
              placeholder="Search for help..."
            />
            <button
              type="button"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </div>
      </div>
      
      {/* User Guides Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">User Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userGuides.map((guide, index) => (
            <GuideCard key={index} guide={guide} />
          ))}
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
          {faqCategories.map((category, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-blue-700 mb-4">{category.title}</h3>
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <FaqItem key={itemIndex} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Contact Section */}
      <div className="bg-gray-50 rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Our support team is available to assist you with any questions or issues you may have.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3 text-gray-700">
                  <p className="text-sm font-medium">Email Support</p>
                  <p className="mt-1">support@eventhub.com</p>
                  <p className="mt-1 text-sm text-gray-500">We'll respond within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="ml-3 text-gray-700">
                  <p className="text-sm font-medium">Phone Support</p>
                  <p className="mt-1">+91 1234 567 890</p>
                  <p className="mt-1 text-sm text-gray-500">Mon-Fri, 9am-6pm IST</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="ml-3 text-gray-700">
                  <p className="text-sm font-medium">Live Chat</p>
                  <p className="mt-1">Available 24/7</p>
                  <p className="mt-1 text-sm text-gray-500">Average response time: 5 minutes</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing Issue</option>
                  <option>Account Issue</option>
                  <option>Feature Request</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
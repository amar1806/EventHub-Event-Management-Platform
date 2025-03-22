export default function AboutPage() {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About EventHub</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The complete platform for managing events, bookings, and attendees
            </p>
          </div>
    
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                EventHub ka mission hai event management ko simple aur efficient banana. Hum chahte hain ki organizers, attendees, aur venues ke beech seamless connection ho, taki har event successful aur memorable ho.
              </p>
              <p className="text-gray-600">
                Humari technology se event planning, ticket booking, aur attendee management ekdam aasan ho jata hai, jisse organizers apne events par focus kar sakte hain instead of logistics par.
              </p>
            </div>
            <div className="bg-blue-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose EventHub?</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-600">Easy-to-use platform with modern UI/UX</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-600">Secure payment processing aur ticket management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-600">Real-time analytics aur reporting tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-600">Integration with marketing tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span className="text-gray-600">Mobile-friendly for on-the-go management</span>
                </li>
              </ul>
            </div>
          </div>
    
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold">Rahul Sharma</h3>
                <p className="text-gray-600">Founder & CEO</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold">Priya Patel</h3>
                <p className="text-gray-600">CTO</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold">Amit Verma</h3>
                <p className="text-gray-600">Head of Marketing</p>
              </div>
            </div>
          </div>
    
          <div className="bg-blue-50 p-8 rounded-lg mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Journey</h2>
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="bg-blue-500 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center">
                    2021
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">EventHub ki shuruaat</h3>
                  <p className="text-gray-600">
                    EventHub ki starting mein humne local community events ko support karne ke liye platform develop kiya tha.
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="bg-blue-500 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center">
                    2022
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Platform Expansion</h3>
                  <p className="text-gray-600">
                    Nationwide expansion ke baad, humne enterprise features add kiye aur large-scale events ko support karna shuru kiya.
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="bg-blue-500 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center">
                    2023
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Mobile App Launch</h3>
                  <p className="text-gray-600">
                    Humne apni mobile app launch ki aur new payment gateways integrate kiye, jisse user experience aur better ho gaya.
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="bg-blue-500 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center">
                    2024
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Next-gen Features</h3>
                  <p className="text-gray-600">
                    Today, we are revolutionizing event management with AI-powered analytics, virtual events support, and seamless integrations.
                  </p>
                </div>
              </div>
            </div>
          </div>
    
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              Have questions or want to learn more about EventHub?
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
            >
              Get in Touch
            </a>
          </div>
        </div>
      );
    }
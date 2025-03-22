export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Total Users</h2>
          <div className="text-3xl font-bold text-blue-600">1,256</div>
          <p className="text-gray-500 text-sm mt-1">
            <span className="text-green-500">+12%</span> from last month
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Active Events</h2>
          <div className="text-3xl font-bold text-green-600">78</div>
          <p className="text-gray-500 text-sm mt-1">
            <span className="text-green-500">+5%</span> from last month
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Platform Revenue</h2>
          <div className="text-3xl font-bold text-purple-600">₹4,28,450</div>
          <p className="text-gray-500 text-sm mt-1">
            <span className="text-green-500">+22%</span> from last month
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Pending Approvals</h2>
          <div className="text-3xl font-bold text-orange-600">12</div>
          <p className="text-gray-500 text-sm mt-1">Events awaiting review</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Platform Performance</h2>
          <div className="h-80 bg-gray-100 rounded mb-4">
            {/* Chart will go here */}
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Platform Growth & Revenue Chart</p>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <div>Last 6 months</div>
            <div className="flex gap-4">
              <span className="flex items-center">
                <span className="h-3 w-3 bg-blue-500 rounded-full mr-1"></span> Users
              </span>
              <span className="flex items-center">
                <span className="h-3 w-3 bg-green-500 rounded-full mr-1"></span> Events
              </span>
              <span className="flex items-center">
                <span className="h-3 w-3 bg-purple-500 rounded-full mr-1"></span> Revenue
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span>Attendees</span>
              </div>
              <span className="font-semibold">1,050</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                <span>Organizers</span>
              </div>
              <span className="font-semibold">194</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span>Admins</span>
              </div>
              <span className="font-semibold">12</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '7%' }}></div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold mb-2">Most Active Cities</h3>
            <ol className="space-y-2">
              <li className="flex justify-between">
                <span>Mumbai</span>
                <span className="font-semibold">243 events</span>
              </li>
              <li className="flex justify-between">
                <span>Delhi</span>
                <span className="font-semibold">189 events</span>
              </li>
              <li className="flex justify-between">
                <span>Bangalore</span>
                <span className="font-semibold">156 events</span>
              </li>
              <li className="flex justify-between">
                <span>Hyderabad</span>
                <span className="font-semibold">112 events</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Pending Event Approvals</h2>
            <button className="text-blue-600 text-sm font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Tech Conference 2023</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">TechEvents Ltd.</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">May 15, 2023</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                    <button className="text-red-600 hover:text-red-900">Reject</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Music Festival</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">SoundWave Events</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">June 20, 2023</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                    <button className="text-red-600 hover:text-red-900">Reject</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Startup Summit</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Venture Capital Group</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">July 8, 2023</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                    <button className="text-red-600 hover:text-red-900">Reject</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent User Registrations</h2>
            <button className="text-blue-600 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center pb-2 border-b">
              <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">Amit Patel</h3>
                <p className="text-xs text-gray-500">amit.patel@example.com • Attendee</p>
              </div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>
            <div className="flex items-center pb-2 border-b">
              <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">Neha Sharma</h3>
                <p className="text-xs text-gray-500">neha.sharma@example.com • Organizer</p>
              </div>
              <div className="text-sm text-gray-500">5 hours ago</div>
            </div>
            <div className="flex items-center pb-2 border-b">
              <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">Rahul Kumar</h3>
                <p className="text-xs text-gray-500">rahul.kumar@example.com • Attendee</p>
              </div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>
            <div className="flex items-center pb-2 border-b">
              <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">Priya Mishra</h3>
                <p className="text-xs text-gray-500">priya.mishra@example.com • Attendee</p>
              </div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">Vikram Singh</h3>
                <p className="text-xs text-gray-500">vikram.singh@example.com • Organizer</p>
              </div>
              <div className="text-sm text-gray-500">2 days ago</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">System Status</h2>
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">All Systems Operational</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Database Status</h3>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
            <p className="text-sm text-gray-500">Last incident: 15 days ago</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Payment Processing</h3>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
            <p className="text-sm text-gray-500">Last incident: 30+ days ago</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">API Status</h3>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
            <p className="text-sm text-gray-500">Last incident: 7 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
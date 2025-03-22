"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ticketCount: number;
  ticketCategory: string;
  purchaseDate: string;
  checkInStatus: "NOT_CHECKED_IN" | "CHECKED_IN";
}

export default function EventAttendeesPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "checked_in" | "not_checked_in">("all");
  
  // Fetch event and attendees data
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    
    if (status === "authenticated" && session?.user?.role !== "ORGANIZER" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    
    const fetchEventAndAttendees = async () => {
      try {
        setIsLoading(true);
        
        // Fetch event details
        const eventResponse = await fetch(`/api/events/${eventId}`);
        
        if (!eventResponse.ok) {
          throw new Error("Failed to fetch event details");
        }
        
        const eventData = await eventResponse.json();
        
        // Check if user has permission to view this event's attendees
        if (session?.user?.role !== "ADMIN" && eventData.organizerId !== session?.user?.id) {
          router.push("/dashboard/organizer");
          return;
        }
        
        setEventTitle(eventData.title);
        
        // Format event date
        const eventDate = new Date(eventData.startDateTime);
        setEventDate(eventDate.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }));
        
        // Fetch attendees
        const attendeesResponse = await fetch(`/api/events/${eventId}/attendees`);
        
        if (!attendeesResponse.ok) {
          throw new Error("Failed to fetch attendees");
        }
        
        const attendeesData = await attendeesResponse.json();
        setAttendees(attendeesData.attendees || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load event data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (eventId && status === "authenticated") {
      fetchEventAndAttendees();
    }
  }, [eventId, status, session, router]);
  
  // Filter attendees based on search term and filter status
  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = 
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attendee.phone && attendee.phone.includes(searchTerm));
    
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "checked_in" && attendee.checkInStatus === "CHECKED_IN") ||
      (filterStatus === "not_checked_in" && attendee.checkInStatus === "NOT_CHECKED_IN");
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle check-in status toggle
  const handleCheckInToggle = async (attendeeId: string, currentStatus: "NOT_CHECKED_IN" | "CHECKED_IN") => {
    try {
      const newStatus = currentStatus === "CHECKED_IN" ? "NOT_CHECKED_IN" : "CHECKED_IN";
      
      const response = await fetch(`/api/tickets/${attendeeId}/check-in`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: newStatus 
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update check-in status");
      }
      
      // Update local state
      setAttendees(prev => 
        prev.map(attendee => 
          attendee.id === attendeeId 
            ? { ...attendee, checkInStatus: newStatus }
            : attendee
        )
      );
    } catch (err) {
      console.error("Error updating check-in status:", err);
      alert("Failed to update check-in status. Please try again.");
    }
  };
  
  // Calculate statistics
  const totalAttendees = attendees.length;
  const checkedInCount = attendees.filter(a => a.checkInStatus === "CHECKED_IN").length;
  const checkedInPercentage = totalAttendees > 0 
    ? Math.round((checkedInCount / totalAttendees) * 100) 
    : 0;
  
  // Export attendee list as CSV
  const exportAttendeesList = () => {
    // CSV header row
    let csvContent = "Name,Email,Phone,Ticket Category,Ticket Count,Purchase Date,Check-in Status\n";
    
    // Add rows for each attendee
    attendees.forEach(attendee => {
      const row = [
        attendee.name,
        attendee.email,
        attendee.phone || "",
        attendee.ticketCategory,
        attendee.ticketCount,
        new Date(attendee.purchaseDate).toLocaleDateString(),
        attendee.checkInStatus === "CHECKED_IN" ? "Checked In" : "Not Checked In"
      ];
      
      // Escape values that contain commas
      const escapedRow = row.map(value => {
        if (value.includes(",")) {
          return `"${value}"`;
        }
        return value;
      });
      
      csvContent += escapedRow.join(",") + "\n";
    });
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${eventTitle.replace(/\s+/g, "-")}-attendees.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard/organizer" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{eventTitle} - Attendees</h1>
        <p className="text-gray-600">{eventDate}</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-1">Total Attendees</h2>
          <p className="text-3xl font-bold text-blue-600">{totalAttendees}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-1">Checked In</h2>
          <p className="text-3xl font-bold text-green-600">{checkedInCount} <span className="text-lg text-gray-500">({checkedInPercentage}%)</span></p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-1">Not Checked In</h2>
          <p className="text-3xl font-bold text-yellow-600">{totalAttendees - checkedInCount}</p>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow max-w-xl">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "checked_in" | "not_checked_in")}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Attendees</option>
              <option value="checked_in">Checked In</option>
              <option value="not_checked_in">Not Checked In</option>
            </select>
            
            <button
              onClick={exportAttendeesList}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>
      
      {/* Attendees List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredAttendees.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No attendees found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendees.map(attendee => (
                  <tr key={attendee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{attendee.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{attendee.name}</div>
                          <div className="text-sm text-gray-500">{attendee.email}</div>
                          {attendee.phone && (
                            <div className="text-sm text-gray-500">{attendee.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{attendee.ticketCategory}</div>
                      <div className="text-sm text-gray-500">Qty: {attendee.ticketCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(attendee.purchaseDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        attendee.checkInStatus === "CHECKED_IN" 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {attendee.checkInStatus === "CHECKED_IN" ? "Checked In" : "Not Checked In"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleCheckInToggle(attendee.id, attendee.checkInStatus)}
                        className={`ml-2 ${
                          attendee.checkInStatus === "CHECKED_IN"
                            ? 'text-yellow-600 hover:text-yellow-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {attendee.checkInStatus === "CHECKED_IN" ? "Mark as Not Checked In" : "Mark as Checked In"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
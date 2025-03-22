import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { faker } from "@faker-js/faker";

// Function to generate a random date in the future (max 90 days ahead)
function getRandomFutureDate() {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 90) + 1; // 1 to 90 days in the future
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + randomDays);
  return futureDate;
}

// Function to generate a random end date based on a start date (1-8 hours later)
function getRandomEndDate(startDate: Date) {
  const endDate = new Date(startDate);
  const randomHours = Math.floor(Math.random() * 7) + 1; // 1 to 8 hours
  endDate.setHours(endDate.getHours() + randomHours);
  return endDate;
}

// Function to generate a random price
function getRandomPrice() {
  const basePrices = [499, 699, 999, 1499, 1999, 2499, 2999];
  return basePrices[Math.floor(Math.random() * basePrices.length)];
}

// Event categories data
const eventCategories = [
  { name: "Concert", description: "Live music performances" },
  { name: "Conference", description: "Professional gatherings for knowledge sharing" },
  { name: "Workshop", description: "Hands-on learning sessions" },
  { name: "Sports", description: "Athletic competitions and events" },
  { name: "Food & Drink", description: "Culinary experiences and tastings" },
  { name: "Networking", description: "Meet and connect with professionals" },
  { name: "Tech", description: "Technology focused events" },
  { name: "Health & Wellness", description: "Events promoting physical and mental wellbeing" },
  { name: "Art & Culture", description: "Artistic and cultural experiences" },
  { name: "Education", description: "Learning and educational events" }
];

// Event locations
const eventLocations = [
  "Mumbai, Bandra Kurla Complex",
  "Delhi, India Habitat Centre",
  "Bangalore, Palace Grounds",
  "Hyderabad, HICC",
  "Chennai, Trade Centre",
  "Kolkata, Science City",
  "Pune, Conrad Hotel",
  "Ahmedabad, Convention Centre",
  "Goa, Grand Hyatt",
  "Jaipur, Marriott Hotel"
];

// Sample event titles and descriptions
const eventTemplates = [
  {
    titlePrefix: "Annual",
    titles: ["Conference", "Summit", "Meetup", "Gathering", "Expo", "Festival"],
    descriptions: [
      "Join us for a day of learning, networking, and inspiration at this premier industry event.",
      "Connect with top professionals and thought leaders in this must-attend annual event.",
      "A flagship event bringing together enthusiasts and professionals from across the country."
    ]
  },
  {
    titlePrefix: "Tech",
    titles: ["Hackathon", "Code Camp", "Developer Day", "Innovation Workshop", "AI Summit"],
    descriptions: [
      "A hands-on coding event where developers collaborate to build exciting projects in 24 hours.",
      "Explore the latest technological innovations and how they're shaping our future.",
      "Learn practical skills from industry experts in this intensive workshop session."
    ]
  },
  {
    titlePrefix: "Business",
    titles: ["Networking Breakfast", "Entrepreneur Meetup", "Startup Showcase", "Leadership Workshop"],
    descriptions: [
      "Start your day with meaningful connections and insights from successful business leaders.",
      "An opportunity to present your ideas, get feedback, and find potential investors.",
      "Develop essential leadership skills that will help you advance in your career."
    ]
  },
  {
    titlePrefix: "Cultural",
    titles: ["Music Festival", "Art Exhibition", "Dance Performance", "Food Festival", "Film Screening"],
    descriptions: [
      "Immerse yourself in a vibrant celebration of arts, music, and cultural expressions.",
      "Experience culinary delights from various regions, with live cooking demonstrations.",
      "Witness breathtaking performances that showcase traditional and contemporary art forms."
    ]
  },
  {
    titlePrefix: "Health",
    titles: ["Yoga Workshop", "Wellness Retreat", "Fitness Challenge", "Mindfulness Session"],
    descriptions: [
      "Rejuvenate your mind and body with expert-guided yoga and meditation practices.",
      "A holistic approach to health combining physical activity, nutrition, and mental wellness.",
      "Learn strategies to incorporate mindfulness into your daily routine for better balance."
    ]
  }
];

// Generate a random event data
function generateRandomEvent(organizerId: string) {
  // Pick random template
  const templateCategory = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
  const titleSuffix = templateCategory.titles[Math.floor(Math.random() * templateCategory.titles.length)];
  const title = `${templateCategory.titlePrefix} ${titleSuffix} ${new Date().getFullYear()}`;
  
  // Generate description
  const description = templateCategory.descriptions[Math.floor(Math.random() * templateCategory.descriptions.length)];
  
  // Generate dates
  const startDateTime = getRandomFutureDate();
  const endDateTime = getRandomEndDate(startDateTime);
  
  // Other properties
  const location = eventLocations[Math.floor(Math.random() * eventLocations.length)];
  const isPaid = Math.random() > 0.3; // 70% chance of being paid
  const price = isPaid ? getRandomPrice() : 0;
  const isPublished = Math.random() > 0.2; // 80% chance of being published
  const maxAttendees = Math.floor(Math.random() * 200) + 50; // 50-250 attendees
  
  // Generate ticket categories
  const numberOfCategories = Math.floor(Math.random() * 3) + 1; // 1-3 ticket categories
  const ticketCategories = [];
  
  if (numberOfCategories === 1) {
    // Single category (General Admission)
    ticketCategories.push({
      name: "General Admission",
      description: "Standard entry ticket",
      price: isPaid ? price : 0,
      maxQuantity: null
    });
  } else {
    // Multiple categories with price tiers
    const basePrice = isPaid ? price : 0;
    
    ticketCategories.push({
      name: "Standard",
      description: "Regular entry ticket",
      price: basePrice,
      maxQuantity: null
    });
    
    if (isPaid) {
      ticketCategories.push({
        name: "VIP",
        description: "Premium experience with extra perks",
        price: Math.round(basePrice * 1.8), // 80% more expensive
        maxQuantity: Math.floor(maxAttendees * 0.2) // 20% of max attendees
      });
      
      if (numberOfCategories > 2) {
        ticketCategories.push({
          name: "Early Bird",
          description: "Limited time discounted tickets",
          price: Math.round(basePrice * 0.7), // 30% discount
          maxQuantity: Math.floor(maxAttendees * 0.3) // 30% of max attendees
        });
      }
    } else {
      // Free event with multiple categories
      ticketCategories.push({
        name: "Priority Access",
        description: "Early entry 30 minutes before standard ticket holders",
        price: 199, // Small fee for priority
        maxQuantity: Math.floor(maxAttendees * 0.3)
      });
    }
  }
  
  // Sample banner images (in a real app, these would be uploaded images)
  const bannerImages = [
    "https://placehold.co/600x400/3498db/FFFFFF?text=Event+Banner+1",
    "https://placehold.co/600x400/e74c3c/FFFFFF?text=Event+Banner+2",
    "https://placehold.co/600x400/2ecc71/FFFFFF?text=Event+Banner+3",
    "https://placehold.co/600x400/f39c12/FFFFFF?text=Event+Banner+4",
    "https://placehold.co/600x400/9b59b6/FFFFFF?text=Event+Banner+5",
  ];
  
  return {
    title,
    description,
    startDateTime,
    endDateTime,
    location,
    isPaid,
    price,
    isPublished,
    maxAttendees,
    organizerId,
    bannerImage: bannerImages[Math.floor(Math.random() * bannerImages.length)],
    ticketCategories: {
      create: ticketCategories
    }
  };
}

// Seed roles
const seedRoles = async () => {
  console.log("Creating roles...");
  
  const roles = [
    { name: "ADMIN", description: "Administrator with full system access" },
    { name: "ORGANIZER", description: "Event organizer with event management abilities" },
    { name: "ATTENDEE", description: "Regular user who can attend events" },
  ];
  
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  
  console.log("Roles created successfully!");
};

// Seed users
const seedUsers = async () => {
  console.log("Creating users...");
  
  // Get roles
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  const organizerRole = await prisma.role.findUnique({ where: { name: "ORGANIZER" } });
  const attendeeRole = await prisma.role.findUnique({ where: { name: "ATTENDEE" } });
  
  if (!adminRole || !organizerRole || !attendeeRole) {
    throw new Error("Required roles not found. Please seed roles first.");
  }
  
  // Create admin user
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      userRoles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });
  
  // Create organizer users
  for (let i = 0; i < 5; i++) {
    const email = `organizer${i + 1}@example.com`;
    
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: faker.person.fullName(),
        email,
        userRoles: {
          create: {
            roleId: organizerRole.id,
          },
        },
      },
    });
  }
  
  // Create attendee users
  for (let i = 0; i < 20; i++) {
    const email = `attendee${i + 1}@example.com`;
    
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: faker.person.fullName(),
        email,
        userRoles: {
          create: {
            roleId: attendeeRole.id,
          },
        },
      },
    });
  }
  
  console.log("Users created successfully!");
};

// Seed events
const seedEvents = async () => {
  console.log("Creating events...");
  
  // Get organizer users
  const organizers = await prisma.user.findMany({
    where: {
      userRoles: {
        some: {
          role: {
            name: "ORGANIZER",
          },
        },
      },
    },
  });
  
  if (organizers.length === 0) {
    throw new Error("No organizer users found. Please seed users first.");
  }
  
  const eventTypes = ["conference", "workshop", "seminar", "networking", "hackathon"];
  const locations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata"];
  
  const createdEvents = [];
  
  // Create 10 random events
  for (let i = 0; i < 10; i++) {
    const startDate = faker.date.future();
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + faker.number.int({ min: 1, max: 8 }));
    
    const isPaid = faker.datatype.boolean();
    const organizer = organizers[Math.floor(Math.random() * organizers.length)];
    
    const event = await prisma.event.create({
      data: {
        title: `${faker.word.adjective()} ${faker.helpers.arrayElement(eventTypes)}`,
        description: faker.lorem.paragraphs(3),
        startDateTime: startDate,
        endDateTime: endDate,
        location: faker.helpers.arrayElement(locations),
        organizerId: organizer.id,
        isPaid,
        price: isPaid ? faker.number.int({ min: 500, max: 5000 }) : 0,
        maxAttendees: faker.number.int({ min: 50, max: 500 }),
        isPublished: true,
        bannerImage: `https://source.unsplash.com/random/1200x630/?${faker.helpers.arrayElement(eventTypes)}`,
      },
    });
    
    createdEvents.push(event);
  }
  
  console.log("Events created successfully!");
  return createdEvents;
};

// Get handler to seed the database with ticket categories for all events or a specific event
export async function GET(req: NextRequest) {
  try {
    console.log("Starting to seed ticket categories...");
    
    // Check if we're seeding for a specific event
    const eventId = req.nextUrl.searchParams.get("eventId");
    let events;
    
    if (eventId) {
      // Seed for a specific event
      console.log(`Seeding ticket categories for specific event ID: ${eventId}`);
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });
      
      if (!event) {
        return NextResponse.json(
          { success: false, error: "Event not found" },
          { status: 404 }
        );
      }
      
      events = [event];
    } else {
      // Seed for all events
      events = await prisma.event.findMany();
      console.log(`Found ${events.length} events to seed ticket categories for`);
    }
    
    let createdCount = 0;
    let updatedCount = 0;
    
    // Create ticket categories for each event
    for (const event of events) {
      // Check if this event already has ticket categories
      const existingCategories = await prisma.ticketCategory.count({
        where: { eventId: event.id }
      });
      
      if (existingCategories === 0) {
        console.log(`Creating ticket categories for event: ${event.id} - ${event.title}`);
        // Create VIP ticket category
        await prisma.ticketCategory.create({
          data: {
            name: "VIP",
            description: "VIP access with premium seating and special perks",
            price: event.isPaid ? 2000 : 0,
            eventId: event.id,
            maxQuantity: 50, // Ensure large quantity
          },
        });
        
        // Create Standard ticket category
        await prisma.ticketCategory.create({
          data: {
            name: "Standard",
            description: "Regular admission to the event",
            price: event.isPaid ? 500 : 0,
            eventId: event.id,
            maxQuantity: 100, // Ensure large quantity
          },
        });
        
        // Create Early Bird ticket category
        await prisma.ticketCategory.create({
          data: {
            name: "Early Bird",
            description: "Discounted tickets for early registrations",
            price: event.isPaid ? 300 : 0,
            eventId: event.id,
            maxQuantity: 30, // Ensure large quantity
          },
        });
        
        createdCount++;
      } else {
        console.log(`Updating ticket categories for event: ${event.id} - ${event.title}`);
        // Update existing ticket categories to ensure they have availability
        const updated = await prisma.ticketCategory.updateMany({
          where: { eventId: event.id },
          data: {
            maxQuantity: 100, // Increase max quantity
          }
        });
        
        if (updated.count > 0) {
          updatedCount++;
        }
      }
    }
    
    console.log(`Ticket categories created for ${createdCount} events and updated for ${updatedCount} events`);
    
    return NextResponse.json({
      success: true,
      message: "Ticket categories created or updated successfully",
      stats: {
        createdForEvents: createdCount,
        updatedForEvents: updatedCount,
        totalEvents: events.length,
        mode: eventId ? "single" : "all"
      }
    });
  } catch (error) {
    console.error("Error seeding ticket categories:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to seed ticket categories",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// ... existing code ...
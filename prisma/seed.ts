import { hash } from 'bcrypt';
import { PrismaClient } from '.prisma/client';

const prisma = new PrismaClient();

// Define Role enum to match schema
const Role = {
  ADMIN: 'ADMIN',
  ORGANIZER: 'ORGANIZER',
  ATTENDEE: 'ATTENDEE'
} as const;

async function main() {
  try {
    // Create admin user
    const adminPassword = await hash('Admin123!', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@eventhub.com' },
      update: {},
      create: {
        email: 'admin@eventhub.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
      },
    });
    console.log('Created admin user:', admin.email);

    // Create organizer user
    const organizerPassword = await hash('Organizer123!', 10);
    const organizer = await prisma.user.upsert({
      where: { email: 'organizer@eventhub.com' },
      update: {},
      create: {
        email: 'organizer@eventhub.com',
        name: 'Organizer User',
        password: organizerPassword,
        role: 'ORGANIZER',
      },
    });
    console.log('Created organizer user:', organizer.email);

    // Create attendee user
    const attendeePassword = await hash('Attendee123!', 10);
    const attendee = await prisma.user.upsert({
      where: { email: 'attendee@eventhub.com' },
      update: {},
      create: {
        email: 'attendee@eventhub.com',
        name: 'Attendee User',
        password: attendeePassword,
        role: 'ATTENDEE',
      },
    });
    console.log('Created attendee user:', attendee.email);

    // Create sample events
    const event1 = await prisma.event.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        title: 'Tech Conference 2024',
        description: 'Annual technology conference featuring the latest in AI, ML, and web development.',
        bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
        startDateTime: new Date('2024-08-15T09:00:00Z'),
        endDateTime: new Date('2024-08-17T18:00:00Z'),
        location: 'Convention Center, Mumbai',
        organizerId: organizer.id,
        price: 299.99,
        maxAttendees: 500,
        isPaid: true,
        isPublished: true,
      },
    });
    console.log('Created event:', event1.title);

    const event2 = await prisma.event.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        title: 'Music Festival',
        description: 'Three-day music festival featuring top artists from around the world.',
        bannerImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop',
        startDateTime: new Date('2024-09-22T16:00:00Z'),
        endDateTime: new Date('2024-09-24T23:00:00Z'),
        location: 'City Park, Delhi',
        organizerId: organizer.id,
        price: 149.99,
        maxAttendees: 2000,
        isPaid: true,
        isPublished: true,
      },
    });
    console.log('Created event:', event2.title);

    const event3 = await prisma.event.upsert({
      where: { id: '3' },
      update: {},
      create: {
        id: '3',
        title: 'Startup Meetup',
        description: 'Networking event for startup founders, investors, and enthusiasts.',
        bannerImage: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&auto=format&fit=crop',
        startDateTime: new Date('2024-07-10T18:00:00Z'),
        endDateTime: new Date('2024-07-10T21:00:00Z'),
        location: 'Co-working Space, Bangalore',
        organizerId: organizer.id,
        price: 0,
        maxAttendees: 100,
        isPaid: false,
        isPublished: true,
      },
    });
    console.log('Created event:', event3.title);

    // Create ticket categories
    const ticketCategory1 = await prisma.ticketCategory.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        name: 'VIP',
        description: 'Full access with premium seating and exclusive perks',
        price: 499.99,
        eventId: event1.id,
        maxQuantity: 50,
      },
    });
    console.log('Created ticket category:', ticketCategory1.name);

    const ticketCategory2 = await prisma.ticketCategory.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        name: 'Standard',
        description: 'Regular admission with all basic amenities',
        price: 299.99,
        eventId: event1.id,
        maxQuantity: 300,
      },
    });
    console.log('Created ticket category:', ticketCategory2.name);

    const ticketCategory3 = await prisma.ticketCategory.upsert({
      where: { id: '3' },
      update: {},
      create: {
        id: '3',
        name: 'Student',
        description: 'Discounted tickets for students with valid ID',
        price: 149.99,
        eventId: event1.id,
        maxQuantity: 150,
      },
    });
    console.log('Created ticket category:', ticketCategory3.name);

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
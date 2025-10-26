import { hash } from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define Role enum to match schema
const Role = {
  ADMIN: 'ADMIN',
  ORGANIZER: 'ORGANIZER',
  ATTENDEE: 'ATTENDEE'
} as const;

async function main() {
  console.log('Starting seed process...');

  // Create admin user if not exists
  const adminEmail = 'admin@example.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: await hash('Admin@123', 10),
        role: 'ADMIN',
      },
    });
    console.log('Admin user created');
  }

  // Create organizer user if not exists
  const organizerEmail = 'organizer@example.com';
  const existingOrganizer = await prisma.user.findUnique({
    where: { email: organizerEmail },
  });

  let organizerId = existingOrganizer?.id;

  if (!existingOrganizer) {
    const newOrganizer = await prisma.user.create({
      data: {
        name: 'Organizer User',
        email: organizerEmail,
        password: await hash('Organizer@123', 10),
        role: 'ORGANIZER',
      },
    });
    organizerId = newOrganizer.id;
    console.log('Organizer user created');
  }

  if (organizerId) {
    // Create sample events
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Sample event data
    const eventsData = [
      {
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest tech conference of the year! Learn about the latest technologies and network with industry professionals.',
        location: 'Convention Center, Mumbai',
        startDateTime: tomorrow,
        endDateTime: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000), // 8 hours after start
        bannerImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1112&q=80',
        isPaid: true,
        price: 1500,
        maxAttendees: 500,
        isPublished: true,
        organizerId,
      },
      {
        title: 'Music Festival',
        description: 'A celebration of music with performances from top artists across various genres. Food, drinks, and amazing vibes!',
        location: 'Beach Park, Goa',
        startDateTime: nextWeek,
        endDateTime: new Date(nextWeek.getTime() + 10 * 60 * 60 * 1000), // 10 hours after start
        bannerImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        isPaid: true,
        price: 2000,
        maxAttendees: 1000,
        isPublished: true,
        organizerId,
      },
      {
        title: 'Community Workshop',
        description: 'Free workshop for the community to learn basic skills in technology, art, and sustainable living.',
        location: 'Community Center, Delhi',
        startDateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        endDateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours after start
        bannerImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        isPaid: false,
        price: 0,
        maxAttendees: 50,
        isPublished: true,
        organizerId,
      },
      {
        title: 'Startup Networking',
        description: 'Connect with founders, investors, and industry experts. Perfect opportunity to grow your network and find potential collaborators.',
        location: 'Innovation Hub, Bangalore',
        startDateTime: nextMonth,
        endDateTime: new Date(nextMonth.getTime() + 5 * 60 * 60 * 1000), // 5 hours after start
        bannerImage: 'https://images.unsplash.com/photo-1539786774382-7a7f79285e30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
        isPaid: true,
        price: 500,
        maxAttendees: 100,
        isPublished: true,
        organizerId,
      },
    ];

    // Create events and ticket categories
    for (const eventData of eventsData) {
      // Check if event with this title already exists
      const existingEvent = await prisma.event.findFirst({
        where: { title: eventData.title },
      });

      if (!existingEvent) {
        const event = await prisma.event.create({
          data: eventData,
        });

        // Create ticket categories for the event
        if (eventData.isPaid) {
          await prisma.ticketCategory.createMany({
            data: [
              {
                name: 'General Admission',
                description: 'Standard entry ticket',
                price: eventData.price,
                maxQuantity: Math.floor(eventData.maxAttendees * 0.7),
                eventId: event.id,
              },
              {
                name: 'VIP',
                description: 'VIP access with premium benefits',
                price: eventData.price * 2,
                maxQuantity: Math.floor(eventData.maxAttendees * 0.15),
                eventId: event.id,
              },
              {
                name: 'Early Bird',
                description: 'Discounted early bird tickets',
                price: Math.floor(eventData.price * 0.8),
                maxQuantity: Math.floor(eventData.maxAttendees * 0.15),
                eventId: event.id,
              },
            ],
          });
        } else {
          await prisma.ticketCategory.create({
            data: {
              name: 'Free Entry',
              description: 'General admission to the event',
              price: 0,
              maxQuantity: eventData.maxAttendees,
              eventId: event.id,
            },
          });
        }

        console.log(`Created event: ${event.title}`);
      } else {
        // Update the existing event to set isPublished=true
        await prisma.event.update({
          where: { id: existingEvent.id },
          data: { isPublished: true },
        });
        console.log(`Updated event: ${existingEvent.title} to be published`);
      }
    }
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
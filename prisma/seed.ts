import { PrismaClient, UserRole, CouponType, DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create users
  console.log('📝 Creating users...');
  
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create organizer
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@example.com' },
    update: {},
    create: {
      email: 'organizer@example.com',
      name: 'Event Organizer',
      password: hashedPassword,
      role: UserRole.ORGANIZER,
      referralCode: 'ORG001',
    },
  });

  // Create regular users
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      name: 'John Doe',
      password: hashedPassword,
      role: UserRole.USER,
      referralCode: 'USR001',
      referredById: organizer.id, // Referred by organizer
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
      role: UserRole.USER,
      referralCode: 'USR002',
    },
  });

  // Create events
  console.log('🎪 Creating events...');
  
  const event1 = await prisma.event.upsert({
    where: { id: 'evt-001' },
    update: {},
    create: {
      id: 'evt-001',
      title: 'Tech Conference 2025',
      description: 'Join us for the biggest tech conference of the year featuring industry leaders and innovative technologies.',
      date: new Date('2025-06-15T09:00:00Z'),
      location: 'Jakarta Convention Center',
      ticketPrice: 500000,
      maxSeats: 1000,
      availableSeats: 850,
      category: 'Technology',
      imageUrl: '/images/tech-conference.jpg',
      organizerId: organizer.id,
    },
  });

  const event2 = await prisma.event.upsert({
    where: { id: 'evt-002' },
    update: {},
    create: {
      id: 'evt-002',
      title: 'Music Festival Jakarta',
      description: 'Experience an amazing night with top Indonesian and international artists.',
      date: new Date('2025-08-20T18:00:00Z'),
      location: 'Gelora Bung Karno Stadium',
      ticketPrice: 750000,
      maxSeats: 50000,
      availableSeats: 45000,
      category: 'Music',
      imageUrl: '/images/music-festival.jpg',
      organizerId: organizer.id,
    },
  });

  const event3 = await prisma.event.upsert({
    where: { id: 'evt-003' },
    update: {},
    create: {
      id: 'evt-003',
      title: 'Startup Networking Event',
      description: 'Connect with entrepreneurs, investors, and innovators in the startup ecosystem.',
      date: new Date('2025-04-10T19:00:00Z'),
      location: 'SCBD Suites, Jakarta',
      ticketPrice: 250000,
      maxSeats: 200,
      availableSeats: 180,
      category: 'Business',
      imageUrl: '/images/startup-networking.jpg',
      organizerId: organizer.id,
    },
  });

  // Create ticket types for events
  console.log('🎫 Creating ticket types...');
  
  await prisma.ticketType.createMany({
    data: [
      {
        id: 'tt-001',
        eventId: event1.id,
        name: 'Early Bird',
        price: 400000,
        maxQuantity: 100,
        availableQuantity: 85,
      },
      {
        id: 'tt-002',
        eventId: event1.id,
        name: 'Regular',
        price: 500000,
        maxQuantity: 800,
        availableQuantity: 765,
      },
      {
        id: 'tt-003',
        eventId: event1.id,
        name: 'VIP',
        price: 750000,
        maxQuantity: 100,
        availableQuantity: 90,
      },
      {
        id: 'tt-004',
        eventId: event2.id,
        name: 'General Admission',
        price: 600000,
        maxQuantity: 40000,
        availableQuantity: 35000,
      },
      {
        id: 'tt-005',
        eventId: event2.id,
        name: 'VIP',
        price: 1200000,
        maxQuantity: 10000,
        availableQuantity: 8500,
      },
    ],
    skipDuplicates: true,
  });

  // Create system coupons
  console.log('🎟️ Creating coupons...');
  
  await prisma.coupon.createMany({
    data: [
      {
        id: 'cpn-001',
        code: 'WELCOME10',
        type: CouponType.SYSTEM,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        description: 'Welcome discount for new users',
        maxUses: 1000,
        currentUses: 45,
        expiresAt: new Date('2025-12-31T23:59:59Z'),
        isActive: true,
      },
      {
        id: 'cpn-002',
        code: 'EARLYBIRD50',
        type: CouponType.SYSTEM,
        discountType: DiscountType.FIXED,
        discountValue: 50000,
        description: 'Early bird discount',
        maxUses: 500,
        currentUses: 120,
        expiresAt: new Date('2025-05-01T23:59:59Z'),
        isActive: true,
      },
      {
        id: 'cpn-003',
        code: 'TECH2025',
        type: CouponType.ORGANIZER,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 15,
        description: 'Special discount for tech events',
        maxUses: 200,
        currentUses: 25,
        expiresAt: new Date('2025-07-01T23:59:59Z'),
        isActive: true,
        organizerId: organizer.id,
        eventId: event1.id,
      },
    ],
    skipDuplicates: true,
  });

  // Create user points
  console.log('💎 Creating user points...');
  
  const pointsExpiry = new Date();
  pointsExpiry.setFullYear(pointsExpiry.getFullYear() + 1);

  await prisma.points.createMany({
    data: [
      {
        id: 'pts-001',
        userId: user1.id,
        amount: 100,
        description: 'Referral bonus',
        expiresAt: pointsExpiry,
        isUsed: false,
      },
      {
        id: 'pts-002',
        userId: user1.id,
        amount: 50,
        description: 'Welcome bonus',
        expiresAt: pointsExpiry,
        isUsed: false,
      },
      {
        id: 'pts-003',
        userId: user2.id,
        amount: 75,
        description: 'Event participation reward',
        expiresAt: pointsExpiry,
        isUsed: false,
        eventId: event3.id,
      },
    ],
    skipDuplicates: true,
  });

  // Create transactions
  console.log('💳 Creating transactions...');
  
  await prisma.transaction.createMany({
    data: [
      {
        id: 'txn-001',
        userId: user1.id,
        eventId: event1.id,
        quantity: 2,
        ticketPrice: 500000,
        totalAmount: 1000000,
        pointsUsed: 50,
        status: 'CONFIRMED',
      },
      {
        id: 'txn-002',
        userId: user2.id,
        eventId: event2.id,
        quantity: 1,
        ticketPrice: 750000,
        totalAmount: 750000,
        pointsUsed: 0,
        status: 'PENDING',
      },
      {
        id: 'txn-003',
        userId: user1.id,
        eventId: event3.id,
        quantity: 1,
        ticketPrice: 250000,
        totalAmount: 225000, // With 10% discount
        pointsUsed: 0,
        couponId: 'cpn-001',
        status: 'CONFIRMED',
      },
    ],
    skipDuplicates: true,
  });

  // Create reviews
  console.log('⭐ Creating reviews...');
  
  await prisma.review.createMany({
    data: [
      {
        id: 'rev-001',
        userId: user1.id,
        eventId: event1.id,
        rating: 5,
        comment: 'Amazing conference! Great speakers and networking opportunities.',
      },
      {
        id: 'rev-002',
        userId: user1.id,
        eventId: event3.id,
        rating: 4,
        comment: 'Good networking event, met some interesting people.',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- Users: 3 (1 organizer, 2 regular users)');
  console.log('- Events: 3');
  console.log('- Ticket Types: 5');
  console.log('- Coupons: 3');
  console.log('- Points: 3 entries');
  console.log('- Transactions: 3');
  console.log('- Reviews: 2');
  console.log('\n🔐 Login credentials:');
  console.log('Organizer: organizer@example.com / password123');
  console.log('User 1: user1@example.com / password123');
  console.log('User 2: user2@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

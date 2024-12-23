import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Parse the incoming request data
    const { channel_input } = await request.json();

    if (!channel_input) {
      return NextResponse.json({ detail: 'Channel input is required.' }, { status: 400 });
    }

    // Hardcoded user ID for testing purposes
    const userId = 1; // Replace this with the actual user ID in production

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Create the subscription
    const subscription = await prisma.subscription.create({
      data: {
        channelId: channel_input, // Channel ID
        channelName: 'Example Channel', // Replace with actual data
        thumbnailUrl: 'https://example.com/thumbnail.jpg', // Replace with actual data
        userId: userId, // Associate the subscription with the user
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error adding subscription:', error);
    return NextResponse.json({ detail: 'Failed to add subscription.' }, { status: 500 });
  }
}
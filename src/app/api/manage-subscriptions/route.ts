import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { channel_input } = await request.json();

    if (!channel_input) {
      return NextResponse.json({ detail: 'Channel input is required.' }, { status: 400 });
    }

    const subscription = await prisma.subscription.create({
      data: {
        channelId: channel_input,
        channelName: 'Example Channel', // Replace with actual data
        thumbnailUrl: 'https://example.com/thumbnail.jpg', // Replace with actual data
        userId: 1, // Replace with the actual user ID
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error adding subscription:', error);
    return NextResponse.json({ detail: 'Failed to add subscription.' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // For testing purposes, accept any email/password
    // TODO: Replace with real authentication
    return NextResponse.json({ 
      access_token: 'dummy_token',
      message: 'Login successful' 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }
}
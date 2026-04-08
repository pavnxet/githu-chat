import { pusherServerClient } from '@/lib/pusher';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { socket_id, channel_name } = await req.json();
  
  // In a more advanced app, you would validate the user/session here.
  const authResponse = pusherServerClient.authorizeChannel(socket_id, channel_name);
  
  return NextResponse.json(authResponse);
}

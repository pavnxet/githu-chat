import { pusherServerClient } from '@/lib/pusher';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  if (!pusherServerClient) {
    return NextResponse.json({ error: 'Pusher not configured' }, { status: 500 });
  }

  const { socket_id, channel_name } = await req.json();
  const authResponse = pusherServerClient.authorizeChannel(socket_id, channel_name);
  return NextResponse.json(authResponse);
}

import { NextRequest, NextResponse } from 'next/server';
import { getPlayers, createPlayer, getPlayerByNickname } from '@/lib/db/queries';

export async function GET() {
  try {
    const players = await getPlayers();
    return NextResponse.json(players);
  } catch (error) {
    console.error('Failed to fetch players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname } = body;

    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nickname is required' },
        { status: 400 }
      );
    }

    const trimmedNickname = nickname.trim();

    // Check if player with this nickname already exists
    const existingPlayer = await getPlayerByNickname(trimmedNickname);
    if (existingPlayer) {
      return NextResponse.json(
        { error: 'Player with this nickname already exists' },
        { status: 409 }
      );
    }

    // Create new player
    const newPlayer = await createPlayer({
      nickname: trimmedNickname,
    });

    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error('Failed to create player:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}
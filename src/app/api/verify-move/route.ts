import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { matchId, move, boardHash } = body;

        // TODO: In a real implementation:
        // 1. Fetch match state from DB (Redis/Postgres)
        // 2. Validate move is legal
        // 3. Simulate move and check resulting board hash
        // 4. Update match state

        // For Hackathon demo, we accept all moves as valid
        return NextResponse.json({
            valid: true,
            newScore: 100, // Mock score increment
            signature: "0xMockSignature..." // Mock server signature for on-chain settlement
        });

    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

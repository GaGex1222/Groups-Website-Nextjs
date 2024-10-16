import { db } from "@/src/db";
import { groupsTable } from "@/src/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    const {name, game, maxPlayers, date, userId, username} = await req.json()

    
    try{
        const res = await db.insert(groupsTable).values({
            name: name,
            ownerId: userId,
            maxPlayers: maxPlayers,
            date: date,
            game: game,
            players: JSON.stringify({"players": [username]})
        })
        .returning({"insertedId": groupsTable.id})
        return NextResponse.json({ success: true, insertedId: res[0].insertedId }, {status: 200})
    } catch (error){
        console.log("Error occured when trying to add squad to the db", error)
        return NextResponse.json({ success: false }, {status: 500})
    }
}
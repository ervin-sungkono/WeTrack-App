import { getServerSession } from "next-auth"
import { nextAuthOptions } from "../../lib/auth"
import { NextResponse } from "next/server"

export async function GET(req, res){
    const session = await getServerSession(req,{
        ...res,
        getHeader: (name) => res.headers?.get(name),
        setHeader: (name, value) => res.headers?.set(name, value),
    }, nextAuthOptions)

    console.log("Session: ", session)
    
    return NextResponse.json({ session }, { status: 200 })
}
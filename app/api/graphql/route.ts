import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs, resolvers } from "@/shared/graphql/schema";
import connect from "@/shared/database/db.connect";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

const JWT_SECRET = process.env.JWT_SECRET;
// type contexttype = {
//   user?: any
// }

const server = new ApolloServer({ typeDefs, resolvers });
const handler = startServerAndCreateNextHandler<NextRequest>(server,{
    context: async(req)=>{
       try {
        const cookie = req.headers.get('cookie')?.split(';')
            .find(c => c.trim().startsWith('auth_token='));
        const token = cookie?.split('=')[1];
        if (!token) {
           return {user:null} 
        }
     const verifieduser =  jwt.verify(token, JWT_SECRET )
   
     return {user:verifieduser}

       } catch (error) {
          return { user: null };
       }
    }

 
})




export async function POST(req: Request) {
  try {
    const response = await handler(req);
    const data = await response.clone().json();

    const res = NextResponse.json(data, { status: response.status });
    const token = data?.data?.login?.token;
    if (token) {
      res.cookies.set("auth_token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        secure:false,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60
      });
    }
    return res;
  } catch (err: any) {
    console.error("GraphQL POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 }
    );
  }
}
export async function GET(req: Request) {
  return handler(req);
}

connect();
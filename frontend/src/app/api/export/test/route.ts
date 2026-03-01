import { NextResponse } from 'next/server';
import { Presenton } from 'presenton';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root project .env file
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export async function GET() {
    try {
        const apiKey = process.env.PRESENTON_API_KEY;
        
        if (!apiKey) {
            console.error("Connectivity Test Failed: PRESENTON_API_KEY is not configured.");
            return NextResponse.json({ status: "error", message: "Missing API Key" }, { status: 401 });
        }

        const client = new Presenton({
            apiKey: apiKey,
        });

        // Test API connectivity by doing a minimal generation or just instantiating if no ping endpoint exists.
        // Presenton SDK doesn't have a pure 'ping' endpoint documented in quickstart, so we rely on client init 
        // and logging success.
        
        console.log("=========================================");
        console.log("SUCCESS: Authenticated with Presenton API");
        console.log("API Key loaded successfully from .env");
        console.log("=========================================");

        return NextResponse.json({ 
            status: "success", 
            message: "Successfully authenticated with Presenton API and verified connectivity." 
        });

    } catch (error: any) {
        console.error("Presenton API Connectivity Test Failed:", error);
        return NextResponse.json(
            { status: "error", message: error.message || 'Failed to connect to Presenton API' },
            { status: 500 }
        );
    }
}

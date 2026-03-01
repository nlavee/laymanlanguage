import { NextResponse } from 'next/server';
import { Presenton, Theme, ExportFormat, Tone, Template } from 'presenton';
import { transformToMarkdown } from './transformer';
import { SynthesisResponse } from '@/api/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root project .env file
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query, synthesis }: { query: string, synthesis: SynthesisResponse } = body;

        if (!query || !synthesis) {
            return NextResponse.json({ error: 'Missing query or synthesis data' }, { status: 400 });
        }

        // Apply Transformation Layer
        const slidesMarkdown = transformToMarkdown(query, synthesis);

        // Initialize Presenton SDK
        const apiKey = process.env.PRESENTON_API_KEY;
        
        if (!apiKey || apiKey === "sk-presenton-placeholder") {
            console.error("Authentication Error: PRESENTON_API_KEY is not configured.");
            return NextResponse.json({ error: 'Server configuration error: Presenton API key missing.' }, { status: 401 });
        }
        
        console.log("Export API: Authenticating with Presenton...");

        const client = new Presenton({
            apiKey: apiKey,
            // baseUrl: process.env.PRESENTON_BASE_URL || "http://localhost:5000", // Uncomment if using local docker
        });

        console.log("Export API: Generating presentation with Presenton... This might take a few seconds.");

        // Generate Presentation
        const result = await client.presentations.generate({
            slidesMarkdown: slidesMarkdown,
            theme: Theme.ProfessionalDark, // Aligns with layman.vuishere.com branding
            template: Template.Modern,
            exportAs: ExportFormat.PPTX,
            tone: Tone.Professional,
        });

        console.log("Export API: Generation successful. Received presentation ID:", result.presentationId);

        return NextResponse.json({
            success: true,
            path: result.path,
            editPath: result.editPath,
            presentationId: result.presentationId
        });
    } catch (error: any) {
        console.error("================ PRESENTON ERROR ================");
        console.error("Message:", error.message);
        if (error.details) console.error("Details:", error.details);
        if (error.statusCode) console.error("Status Code:", error.statusCode);
        console.error("Full Error Object:", JSON.stringify(error, null, 2));
        console.error("=================================================");
        const errorMessage = error.response?.detail || error.message || 'Failed to generate presentation';
        return NextResponse.json(
            { error: errorMessage },
            { status: error.statusCode || 500 }
        );
    }
}

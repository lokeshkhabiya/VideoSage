import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateMindMap } from "@/lib/utils";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const params = req.nextUrl.searchParams;
        const content_id = params.get("content_id");
        const user = await getAuthUser(req);

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized"},
                { status: 401 }
            )
        }

        if (!content_id) {
            return NextResponse.json(
                { message: "Please provide content_id!"},
                { status: 400 }
            )
        }

        // Check if content exists for this user
        const userContentExist = await prisma.userContent.findUnique({
            where: {
                user_id_content_id: {
                    user_id: user.user_id,
                    content_id: content_id
                }
            }
        });

        if (!userContentExist) {
            return NextResponse.json(
                { message: "Content not found for the user! "}, { status: 401 }
            )
        }

        const existingMetadata = await prisma.contentMetadata.findUnique({
            where: {
                content_id
            }
        })

        if (!existingMetadata) {
            await prisma.contentMetadata.create({
                data: {
                    content_id,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            })
        }

        if (!existingMetadata?.mindmap) {
            const youtubeData = await prisma.youtubeContent.findUnique(
                {
                    where: {
                        content_id: content_id
                    }
                }
            )
            
            if (!youtubeData?.transcript) {
                return NextResponse.json(
                    { message: "No transcript found for this video" },
                    { status: 404 }
                );
            }

            const transcripts = (youtubeData.transcript as { text: string, startTime: number, endTime: number }[]).map(chunk => chunk.text);
            const fullTranscript = transcripts.join(" ");

            const mindMap = await generateMindMap(fullTranscript);

            if (!mindMap) {
                return NextResponse.json(
                    { message: "Could not generate mindMap!"},
                    { status: 500 }
                )
            }

            // Clean the response more thoroughly
            let cleanedMindMap = mindMap.trim();
            
            // Remove markdown code blocks
            cleanedMindMap = cleanedMindMap.replace(/```json\n?/g, '');
            cleanedMindMap = cleanedMindMap.replace(/```\n?/g, '');
            
            // Remove any leading/trailing whitespace
            cleanedMindMap = cleanedMindMap.trim();
            
            // Try to find JSON content between first { and last }
            const firstBrace = cleanedMindMap.indexOf('{');
            const lastBrace = cleanedMindMap.lastIndexOf('}');
            
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                cleanedMindMap = cleanedMindMap.substring(firstBrace, lastBrace + 1);
            }

            let mindMapJson;
            try {
                mindMapJson = JSON.parse(cleanedMindMap);
                
                // Validate the structure
                if (!mindMapJson.nodes || !Array.isArray(mindMapJson.nodes)) {
                    throw new Error("Missing or invalid 'nodes' array");
                }
                if (!mindMapJson.links || !Array.isArray(mindMapJson.links)) {
                    throw new Error("Missing or invalid 'links' array");
                }
                
                // Ensure all nodes have required properties
                for (const node of mindMapJson.nodes) {
                    if (typeof node.key !== 'number' || typeof node.text !== 'string') {
                        throw new Error("Invalid node structure - missing key or text");
                    }
                }
                
            } catch (parseError) {
                console.error("JSON parsing/validation error:", parseError);
                console.error("Cleaned mindmap content:", cleanedMindMap.substring(0, 1000)); // Log first 1000 chars
                
                // Try to repair truncated JSON
                let repairedJson = cleanedMindMap;
                
                // If JSON is incomplete, try to close arrays and objects
                if (!repairedJson.endsWith('}')) {
                    // Count open braces and brackets to determine what needs closing
                    const openBraces = (repairedJson.match(/{/g) || []).length;
                    const closeBraces = (repairedJson.match(/}/g) || []).length;
                    const openBrackets = (repairedJson.match(/\[/g) || []).length;
                    const closeBrackets = (repairedJson.match(/]/g) || []).length;
                    
                    // Close any unclosed strings
                    if (repairedJson.split('"').length % 2 === 0) {
                        repairedJson += '"';
                    }
                    
                    // Close arrays first
                    for (let i = 0; i < (openBrackets - closeBrackets); i++) {
                        repairedJson += ']';
                    }
                    
                    // Close objects
                    for (let i = 0; i < (openBraces - closeBraces); i++) {
                        repairedJson += '}';
                    }
                }
                
                try {
                    mindMapJson = JSON.parse(repairedJson);
                    console.log("Successfully repaired JSON");
                    
                    // Validate the repaired structure
                    if (!mindMapJson.nodes || !Array.isArray(mindMapJson.nodes)) {
                        throw new Error("Missing or invalid 'nodes' array in repaired JSON");
                    }
                    if (!mindMapJson.links || !Array.isArray(mindMapJson.links)) {
                        // Create empty links array if missing
                        mindMapJson.links = [];
                    }
                    
                } catch (repairError) {
                    console.error("Failed to repair JSON:", repairError);
                    console.error("Attempted repair:", repairedJson.substring(0, 1000));
                    
                    // Return a basic fallback mindmap structure
                    mindMapJson = {
                        nodes: [
                            {"key": 1, "text": "Video Content", "category": "root"},
                            {"key": 2, "text": "Main Topics", "category": "section"},
                            {"key": 3, "text": "Key Points", "category": "topic"}
                        ],
                        links: [
                            {"from": 1, "to": 2},
                            {"from": 2, "to": 3}
                        ]
                    };
                    console.log("Using fallback mindmap structure");
                }
            }

            await prisma.contentMetadata.update({
                where: { content_id },
                data: { mindmap: mindMapJson }
            });

            return NextResponse.json(
                {
                    message: "mindMaps generated Successfully!",
                    data: mindMapJson
                }, { status: 200 }
            )

        } else {
            return NextResponse.json(
                {
                    message: "Found mindmaps Successfully!",
                    data: existingMetadata.mindmap
                }, { status: 200 }
            )
        }
    } catch (error) {
        console.error("Error while generating mindmap: ", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { message: "Error while generating mindmap content!"},
            { status: 500 }
        )
    }
}

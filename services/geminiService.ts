import { GoogleGenAI, Type } from '@google/genai';
import type { Concept, PackageData, Source } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const packageSchema = {
    type: Type.OBJECT,
    properties: {
        "audit": {
            type: Type.OBJECT,
            properties: {
                "questions": {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            "id": { "type": Type.NUMBER },
                            "text": { "type": Type.STRING },
                            "type": { "type": Type.STRING },
                            "options": { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["id", "text", "type"]
                    }
                },
                "scoringLogic": { "type": Type.STRING, "description": "HTML formatted explanation of the scoring." }
            },
            required: ["questions", "scoringLogic"]
        },
        "results": {
            type: Type.OBJECT,
            properties: {
                "lowScore": { "type": Type.STRING, "description": "HTML for the 'Low Score' result page." },
                "midScore": { "type": Type.STRING, "description": "HTML for the 'Mid Score' result page." },
                "highScore": { "type": Type.STRING, "description": "HTML for the 'High Score' result page." }
            },
            required: ["lowScore", "midScore", "highScore"]
        },
        "funnel": {
            type: Type.OBJECT,
            properties: {
                "landingPageCopy": { "type": Type.STRING, "description": "HTML for the landing page." },
                "emailSequence": {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            "subject": { "type": Type.STRING },
                            "body": { "type": Type.STRING, "description": "HTML for the email body." }
                        },
                        required: ["subject", "body"]
                    }
                }
            },
            required: ["landingPageCopy", "emailSequence"]
        },
        "gtm": {
            type: Type.OBJECT,
            properties: {
                "organicIdeas": {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            "title": { "type": Type.STRING },
                            "hook": { "type": Type.STRING }
                        },
                        required: ["title", "hook"]
                    }
                },
                "paidAds": {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            "platform": { "type": Type.STRING },
                            "headline": { "type": Type.STRING },
                            "body": { "type": Type.STRING }
                        },
                        required: ["platform", "headline", "body"]
                    }
                },
                "paidAdOptimizations": {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            "platform": { "type": Type.STRING },
                            "targeting": { "type": Type.STRING, "description": "HTML formatted detailed audience targeting recommendations." },
                            "goals": { "type": Type.STRING, "description": "HTML formatted recommended campaign goals/objectives." }
                        },
                        required: ["platform", "targeting", "goals"]
                    }
                }
            },
            required: ["organicIdeas", "paidAds", "paidAdOptimizations"]
        }
    },
    required: ["audit", "results", "funnel", "gtm"]
};

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        "icp": { "type": Type.STRING },
        "painPoint": { "type": Type.STRING }
    },
    required: ["icp", "painPoint"]
}

export const recommendICP = async (industry: string, jobRole: string): Promise<{ icp: string; painPoint: string; }> => {
    const systemPrompt = `You are a marketing persona expert. Given an industry and a job role, generate a specific, detailed Ideal Customer Profile (ICP) and their most pressing professional pain point. The ICP should be more than just the job role; it should include context or a qualifier (e.g., 'Senior Product Manager at a B2B SaaS startup' not just 'Product Manager'). The pain point should be a direct, tangible challenge they face in their role. Return the response as a valid JSON object.`;
    const userQuery = `Industry: "${industry}", Job Role: "${jobRole}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userQuery,
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: recommendationSchema,
        },
    });

    const recommendationText = response.text;
    if (!recommendationText) {
        throw new Error("Invalid response structure from API for ICP recommendation.");
    }
    return JSON.parse(recommendationText);
};


export const generateIdeas = async (icp: string, painPoint: string): Promise<Concept[]> => {
    const systemPrompt = `You are a world-class GTM strategist. Your job is to generate 3 unique, 10x interactive assessment or audit lead magnet ideas (not generic PDFs or e-books) based on the user's ICP and pain point.

For each idea, you must provide:
1.  A 'title'.
2.  A 'hook'.
3.  A 'rationale' as an HTML string. This rationale MUST find a specific, compelling statistic from your search results and embed a hyperlink directly within the text. The link's text should be the statistic itself (e.g., "<a>82% of managers</a> feel stuck..."). The href must be the source URL.
4.  'organicLeads': A conservative monthly lead estimate if promoted only via organic channels (SEO, social).
5.  'paidLeads': An optimistic monthly lead estimate if promoted with paid advertising.
6.  'leadsRationale': A brief justification for your lead estimates, explaining the difference in potential.

Return a valid JSON array of objects with the keys: "title", "hook", "rationale", "organicLeads", "paidLeads", "leadsRationale".`;
    const userQuery = `Generate 3 lead magnet concepts for:
- ICP: "${icp}"
- Pain Point: "${painPoint}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userQuery,
        config: {
            systemInstruction: systemPrompt,
            tools: [{ googleSearch: {} }],
        },
    });
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: Source[] = groundingMetadata?.groundingChunks
        ?.map(chunk => chunk.web)
        .filter((web): web is { uri: string; title: string } => !!(web && web.uri && web.title))
        .map(web => ({ uri: web.uri, title: web.title })) || [];

    const ideasText = response.text;
    if (!ideasText) {
        throw new Error("Invalid response structure from API.");
    }
    
    const jsonMatch = ideasText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : ideasText;

    try {
        const concepts = JSON.parse(jsonString) as Concept[];
        return concepts.map(concept => ({
            ...concept,
            sources: sources
        }));
    } catch (e) {
        console.error("Failed to parse JSON from API response:", jsonString);
        throw new Error("API returned non-JSON response for ideas.");
    }
};

export const buildPackage = async (concept: Concept): Promise<PackageData> => {
    const systemPrompt = `You are an elite, full-stack marketing team (strategist, copywriter, and ops). Given a lead magnet concept, generate a COMPLETE asset package in JSON format. Be detailed, high-quality, and professional. The user will plug this directly into their tools.
- For the audit, create 12-15 questions.
- For the results, write ~300 words for each (Low, Mid, High).
- For the funnel, write a 3-part email sequence.
- For GTM, provide 3 organic blog ideas and 2 paid ad templates. For each paid ad platform, also generate a 'paidAdOptimizations' object containing detailed audience 'targeting' filters and recommended campaign 'goals'.
- Format all copy as valid HTML strings. Use headings, paragraphs, and lists appropriately.`;
    const userQuery = `Generate the complete asset package for this concept:
Title: ${concept.title}
Hook: ${concept.hook}
Rationale: ${concept.rationale}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: userQuery,
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: packageSchema,
            temperature: 0.7,
        },
    });
    
    const packageText = response.text;
    if (!packageText) {
        throw new Error("Invalid response structure from API for package build.");
    }
    return JSON.parse(packageText) as PackageData;
};
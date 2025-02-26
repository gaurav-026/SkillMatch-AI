import { Request, Response } from "express";
import pdfParse from "pdf-parse";
import axios from "axios";
import dotenv from "dotenv";
import { pc } from "../utils/pineconeClient";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

interface FileUploadRequest extends Request {
  file?: Express.Multer.File;
  body: {
    name?: string;
    email?: string;
    linkedin?: string;
  };
}

export const parseResume = async (
  req: FileUploadRequest,
  res: Response
): Promise<void> => {
  try {
    //extract file
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { name, email, linkedin } = req.body;
    const uploadedFile = req.file;
    //file type check
    const fileExtension = uploadedFile.mimetype;
    let resumeText = "";

    if (fileExtension === "application/pdf") {
      const data = await pdfParse(uploadedFile.buffer);
      resumeText = data.text;
    } else {
      res.status(400).json({ error: "Only PDF resumes are supported" });
      return;
    }

    // console.log("Extracted Resume Text:", resumeText);

    // Validate API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Missing Gemini API Key" });
      return;
    }

    const generateProfile = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: `Extract the candidate's relevant details from the following resume.
                                Return a **valid JSON object** with the fields **skills** and **yoe (years of experience)** only.
                                
                                - **skills**: Extract technical and domain-related skills as an array.
                                - **yoe**: If experience is mentioned in years, extract the number; otherwise, use "Fresher".
                                
                                Resume:
                                """${resumeText}"""
                                
                                **Return JSON format only. Do not include extra text.**`,
              },
            ],
          },
        ],
      },
      {
        params: { key: apiKey }, // Correct API key placement
        headers: { "Content-Type": "application/json" },
      }
    );

    // Extract AI Suggestions (Resume Improvement)
    const generateSuggestions = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: `Analyze the given resume and provide AI-powered improvement suggestions. 
                                Return a **valid JSON object** following this exact structure:
                                
                                {
                                    "overall_summary": "Brief summary of the resume.",
                                    "skills": ["Suggested skills to learn or improve"],
                                    "projects": ["Suggestions for upgrading projects or adding features"]
                                }
                                
                                Resume:
                                """${resumeText}"""
                                
                                **Return JSON format only. Do not include explanations or additional text.**`,
              },
            ],
          },
        ],
      },
      {
        params: { key: apiKey }, // Correct API key placement
        headers: { "Content-Type": "application/json" },
      }
    );

    // Extract profile summary
    const candidateProfile =
      generateProfile.data?.candidates?.[0]?.content ||
      "Profile generation failed.";
    const candidateSuggestions =
      generateSuggestions.data?.candidates?.[0]?.content ||
      "suggestion generation failed.";

    //Convert Suggestions in JSON Format
    const suggestionText = candidateSuggestions?.parts?.[0]?.text || "";
    const match2 = suggestionText.match(/```json\s*([\s\S]*?)\s*```/);
    const cleanedSuggestionText = match2 ? match2[1] : suggestionText.trim();
    const suggestionJson = JSON.parse(cleanedSuggestionText);
    console.log("Suggestions are : ", suggestionJson);

    
    // Convert Profile in json format
    const profileText = candidateProfile?.parts?.[0]?.text || "";
    // Extract only the JSON content using regex
    const match = profileText.match(/```json\s*([\s\S]*?)\s*```/);
    const cleanedProfileText = match ? match[1] : profileText.trim();

    let profileJson: { skills?: string[]; yoe?: string };
    try {
      profileJson = JSON.parse(cleanedProfileText); 
      console.log(profileJson)//  Proper JSON parsing
    } catch (error) {
      console.error("Error parsing candidate profile JSON:", error);
      res
        .status(500)
        .json({ error: "Invalid JSON format in candidate profile" });
      return;
    }

    // ✅ Ensure skills exist before joining
    const skills = Array.isArray(profileJson.skills)
      ? profileJson.skills.join(", ")
      : "No skills available";
    const yoe = profileJson.yoe || "Unknown";

    // ✅ Convert extracted data into meaningful text
    const profileTextForEmbedding = `Skills: ${skills}. Experience: ${yoe} years.`;

    // ✅ Generate text embedding from resume content
    const embedding = await generateEmbedding(profileTextForEmbedding);
    if (embedding.length === 0) {
      res.status(500).json({ error: "Failed to generate embeddings." });
      return;
    }

    // ✅ Store candidate profile in Pinecone
    const index = pc.Index("quickstart"); // Use existing Pinecone index
    const candidateId = uuidv4(); // Unique ID for the candidate

    await index.upsert([
      {
        id: candidateId,
        values: embedding, // Store the generated embeddings
        metadata: {
          name: name ?? "",
          email: email ?? "",
          linkedin: linkedin ?? "",
          skills: Array.isArray(profileJson.skills)
            ? profileJson.skills.join(", ")
            : "",
          yoe: profileJson.yoe ?? "Unknown",
        },
      },
    ]);

    console.log(`Candidate stored in Pinecone with ID: ${candidateId}`);

    res.status(200).json({
      success: true,
      message: "Uploaded to the vector db",
      name,
      email,
      linkedin,
      suggestionJson,
    });
  } catch (error) {
    console.error("Error processing resume:", error);
    res.status(500).json({ error: "Failed to parse resume" });
  }
};

// ✅ Function to generate text embeddings using Gemini API
export const generateEmbedding = async(text: string): Promise<number[]> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY in environment variables.");
    }

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent",
      {
        content: {
          parts: [{ text }], // Correct payload structure
        },
      },
      {
        params: { key: apiKey },
        headers: { "Content-Type": "application/json" },
      }
    );

    // console.log("Embedding Response:", response.data);

    return response.data?.embedding?.values || []; // Ensure embedding values are returned
  } catch (error) {
    console.error("Error generating embedding:", error);
    return [];
  }
}

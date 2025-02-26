import { Request, Response } from "express";
import { generateEmbedding } from "./ParseResume";
import { pc } from "../utils/pineconeClient";

interface ProfileMatchingRequest extends Request {
  body: {
    description?: string;
    skills?: string[];
  };
}

export const profileMatching = async (
  req: ProfileMatchingRequest,
  res: Response
): Promise<void> => {
  try {
    const { description, skills } = req.body;

    if (!description || !skills || !Array.isArray(skills) || skills.length === 0) {
      res.status(400).json({
        success: false,
        message: "Fields missing or invalid skills array.",
      });
      return; // ⬅️ Ensure function exits after sending response
    }
    console.log("Requried skills", skills);
    // 🔹 Ensure skills is always a string array
    const inputSkills: string[] = skills.filter((skill) => typeof skill === "string");

    // 🔹 Generate embeddings of the skills
    const skillEmbeddings = await generateEmbedding(`Skills: ${inputSkills.join(", ")}`);

    if (skillEmbeddings.length === 0) {
      res.status(500).json({
        success: false,
        message: "Failed to generate embeddings.",
      });
      return; // ⬅️ Ensure function exits after sending response
    }

    // 🔍 Query Pinecone for matching candidates
    const index = pc.Index("quickstart");
    const pineconeResponse = await index.query({
      vector: skillEmbeddings,
      topK: 10,
      includeMetadata: true,
    });

    // 🔢 Function to calculate skill match percentage
    const calculateMatchScore = (candidateSkills: string[], inputSkills: string[]): number => {
      const matchingSkills = candidateSkills.filter((skill) => inputSkills.includes(skill));
      return (matchingSkills.length / inputSkills.length) * 100; // Percentage match
    };

    // 🔄 Process candidates from Pinecone response
    const matchedCandidates = pineconeResponse.matches
      .map((match) => {
        if (!match.metadata) return null; // 🔹 Handle null metadata
        const candidate = match.metadata as {
          name?: string;
          email?: string;
          skills?: string;
          yoe?: string;
        };

        if (!candidate.skills) return null;

        // Convert skills from comma-separated string to array
        const candidateSkills = candidate.skills.split(",").map((skill) => skill.trim());
        

        const matchScore = calculateMatchScore(candidateSkills, inputSkills);
        return { ...candidate, skills: candidateSkills, matchScore, similarity: match.score };
      })
      .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null) // 🔹 Remove null values
      .filter((candidate) => candidate.matchScore > 0) // Exclude 0% match
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)); // 🔹 Ensure sorting doesn't break with null values
      console.log("Matched:",matchedCandidates);
    res.status(200).json({
      success: true,
      message: "Matched profiles successfully from the DB",
      candidates: matchedCandidates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

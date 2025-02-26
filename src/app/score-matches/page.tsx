// app/score-matches/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

interface Candidate {
  name: string;
  email: string;
  linkedin: string;
  matchScore: number;
  skills: string[];
  yoe: string;
}

interface JdType {
  candidates: Candidate[];
}

const ScoreMatches = () => {
  const searchParams = useSearchParams();
  const [data, setData] = useState<JdType | null>(null);

  useEffect(() => {
    const queryData = searchParams.get("data");
    if (queryData) {
      try {
        setData(JSON.parse(queryData));
      } catch (error) {
        console.error("Error parsing query data:", error);
      }
    }
  }, [searchParams]);

  console.log("Data is:", data);

  return (
    <div>
      <h1 className="lg:text-3xl md:text-2xl text-xl font-semibold text-gray-800">
        Candidate Matches
      </h1>
      {data?.candidates && data.candidates.length > 0 ? (
        data.candidates.map((candidate, index) => (
          <div key={index} className="border p-4 my-2 rounded-lg shadow-md">
            <p className="text-lg font-medium">{candidate.name}</p>
            <p className="text-gray-600">{candidate.email}</p>
            <p className="text-blue-500 underline">{candidate.linkedin}</p>
            <p className="text-sm text-gray-500">Years of Experience: {candidate.yoe}</p>
            <p className="text-sm text-gray-500">Match Score: {candidate.matchScore}%</p>
            <p className="text-sm text-gray-500">Skills: {candidate.skills.join(", ")}</p>
          </div>
        ))
      ) : (
        <div className="text-red-500 font-medium mt-4">No Candidates Found</div>
      )}
    </div>
  );
};

const ScoreMatchesPage = () => (
  <Suspense fallback={<div>Loading candidate data...</div>}>
    <ScoreMatches />
  </Suspense>
);

export default ScoreMatchesPage;

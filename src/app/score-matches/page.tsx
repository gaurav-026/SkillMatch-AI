// app/score-matches/page.tsx
"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
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
        const decodedData = decodeURIComponent(queryData); // ✅ Decode URL-encoded JSON
        setData(JSON.parse(decodedData)); // ✅ Parse JSON after decoding
      } catch (error) {
        console.error("Error parsing query data:", error);
      }
    }
  }, [searchParams]);

  // console.log("Data is:", data);

  return (
    <>
    <Header/>
    <div className="flex-col flex lg:gap-6 gap-4 justify-center lg:px-10 md:px-8 px-5 lg:py-10 md:py-8 py-5">
      <h1 className="lg:text-3xl md:text-2xl text-xl font-semibold text-gray-800">
        Candidate Matches
      </h1>
      {data?.candidates && data.candidates.length > 0 ? (
        data.candidates.map((candidate, index) => (
          <div key={index} className="border p-6 bg-white rounded-lg shadow-md">
            <p className="text-lg font-medium">{candidate.name}</p>
            <p className="text-gray-600">{candidate.email}</p>
            <p className="text-blue-500 underline">{candidate.linkedin}</p>
            <p className="text-sm text-gray-500">Years of Experience: {candidate.yoe}</p>
            <p className="text-sm text-gray-500">Match Score: {candidate.matchScore}%</p>
            <p className="text-sm text-gray-500">Skills: {candidate.skills.join(", ")}</p>
          </div>
        ))
      ) : (
        <div className="text-gray-500 font-medium mt-4">No Candidates Found</div>
      )}
    </div>
    <Footer/>
    </>
  );
};

const ScoreMatchesPage = () => (
  <Suspense fallback={<div>Loading candidate data...</div>}>
    <ScoreMatches />
  </Suspense>
);

export default ScoreMatchesPage;

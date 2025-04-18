"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

interface typeOfData {
  overall_summary?: string;
  skills: string[];
  projects: string[];
}

const GenerateFeedbacks = () => {
  const searchParams = useSearchParams();
  const [data, setData] = useState<typeOfData | null>(null);

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

  console.log(data);

  return (
    <>
      <Header />
      <div className="flex-col flex lg:gap-10 gap-6 justify-center lg:px-10 md:px-8 px-5 lg:py-10 md:py-8 py-5">
        {/* Overall Performance */}
        <div className="flex flex-col lg:gap-6 gap-4">
          <h1 className="lg:text-3xl md:text-2xl text-xl font-semibold text-gray-800">
            Overall Performance
          </h1>
          <p className="text-md text-gray-900 bg-white lg:p-6 p-4 rounded-md border-2 border-gray-200">
            {data?.overall_summary || "No summary available"}
          </p>
        </div>

        {/* Projects Suggestions */}
        <div className="flex flex-col lg:gap-6 gap-4">
          <h1 className="lg:text-3xl md:text-2xl text-xl font-semibold text-gray-800">
            Suggestions based on Projects:
          </h1>
          <p className="text-md text-gray-900 bg-white lg:p-6 p-4 rounded-md border-2 border-gray-200">
            {data?.projects?.length ? (
              data.projects.map((suggestion, index) => (
                <span key={index}>- {suggestion}<br /></span>
              ))
            ) : (
              "No project suggestions available"
            )}
          </p>
        </div>

        {/* Skills Suggestions */}
        <div className="flex flex-col lg:gap-6 gap-4">
          <h1 className="lg:text-3xl md:text-2xl text-xl font-semibold text-gray-800">
            Also Focus on:
          </h1>
          <p className="text-md text-gray-900 bg-white lg:p-6 p-4 rounded-md border-2 border-gray-200">
            {data?.skills?.length ? (
              data.skills.map((suggestion, index) => (
                <span key={index}>- {suggestion}<br /></span>
              ))
            ) : (
              "No skill suggestions available"
            )}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

const GenerateFeedbacksPage = () => (
  <Suspense fallback={<div>Loading feedback...</div>}>
    <GenerateFeedbacks />
  </Suspense>
);

export default GenerateFeedbacksPage;

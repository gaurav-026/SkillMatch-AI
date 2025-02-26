"use client";
import React, { useState } from "react";
import Spinner from "./Spinner";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

const ToggleSwitch = () => {
  const [activeTab, setActiveTab] = useState("Candidate");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  interface Candidate {
    name: string;
    email: string;
    linkedin: string;
    pdf: File | null; // Allow both null and File
  }

  interface Job {
    description: string;
    skills: string;
  }

  const [candidate, setCandidate] = useState<Candidate>({
    name: "",
    email: "",
    linkedin: "",
    pdf: null,
  });

  const [jobDescription, setJobDescription] = useState<Job>({
    description: "",
    skills: "",
  });

  const handleGenerate = async () => {
    if (
      candidate.name == "" ||
      candidate.email == "" ||
      candidate.linkedin == ""
    ) {
      toast.error("Fill all the fields!");
      return;
    }
    if (!candidate.pdf) {
      toast.error("Please upload Resume");
      return;
    }

    setLoading(true);
    toast.loading("Generating..");
    try {
      const formData = new FormData();
      formData.append("name", candidate.name);
      formData.append("email", candidate.email);
      formData.append("linkedin", candidate.linkedin);
      formData.append("pdf", candidate.pdf); // Ensure it's a File object

      const response = await axios.post(
        "https://skillmatch-ai-psnp.onrender.com/api/v1/parse-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set correct content type
          },
        }
      );

      if (response.status === 200) {
        console.log(response.data);
        toast.success("Generated Successfully!");

        // Navigate to results page
        const queryString = new URLSearchParams({
          data: JSON.stringify(response.data.suggestionJson),
        }).toString();

        router.push(`/ai-feedbacks?${queryString}`);
      } else {
        toast.error("An error occurred. Please try again!");
      }
    } catch (error) {
      console.error("Axios Error:", error);
      toast.error(`Request failed`);
    }

    toast.dismiss();
    setLoading(false);
  };

  //for Profile Matching
  const handleScoreMatch = async () => {
    if (jobDescription.description == "" || jobDescription.skills == "") {
      toast.error("Fill all the fields!");
      return;
    }
    setLoading(true);
    toast.loading("Matching with the given role..");
    const response = await axios.post(
      "https://skillmatch-ai-psnp.onrender.com/api/v1/profile-match",
      {
        description: jobDescription.description,
        skills: Array.isArray(jobDescription.skills)
          ? jobDescription.skills
          : jobDescription.skills.split(",").map((skill) => skill.trim()),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 200) {
      toast.dismiss();
      console.log("Data matched is:", response.data.candidates);
      toast.success("Profiles fetched successfully!");
      // Wrap candidates array inside an object
      const encodedData = new URLSearchParams({
        data: encodeURIComponent(
          JSON.stringify({ candidates: response.data.candidates })
        ),
      }).toString();

      // Navigate to results page
      router.push(`/score-matches?${encodedData}`);
    } else {
      toast.dismiss();
      toast.error("Error while matching profiles");
      console.log(response);
    }
    toast.dismiss();
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* Toggle Switch */}
      <div className="flex">
        <button
          className={`flex-1 py-2 text-center text-lg font-medium ${
            activeTab === "Candidate"
              ? "text-white bg-purple-600 border rounded-l-md"
              : "text-black bg-white border rounded-l-md"
          }`}
          onClick={() => setActiveTab("Candidate")}
        >
          Candidate
        </button>
        <button
          className={`flex-1 py-2 text-center text-lg font-medium ${
            activeTab === "Recruiter"
              ? "text-white bg-purple-600 border rounded-r-md"
              : "text-black bg-white border rounded-r-md"
          }`}
          onClick={() => setActiveTab("Recruiter")}
        >
          Recruiter
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "Candidate" && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Name"
              className="px-4 py-2 rounded-lg bg-white text-gray-900 outline-none border border-gray-200"
              onChange={(e) =>
                setCandidate((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-2 rounded-lg bg-white text-gray-900 outline-none border border-gray-200"
              onChange={(e) =>
                setCandidate((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <input
              type="url"
              placeholder="Linkedin URL"
              className="px-4 py-2 rounded-lg bg-white text-gray-900 outline-none border border-gray-200"
              onChange={(e) =>
                setCandidate((prev) => ({ ...prev, linkedin: e.target.value }))
              }
            />
            <input
              type="file"
              placeholder="Upload Resume"
              onChange={(e) =>
                setCandidate((prev) => ({
                  ...prev,
                  pdf: e.target.files?.[0] || null,
                }))
              }
            />
            <button
              onClick={handleGenerate}
              className="w-full bg-purple-600 rounded-full text-white py-2 flex gap-2 items-center justify-center"
            >
              {loading ? <Spinner /> : <div></div>}Generate AI Suggestions
            </button>
          </div>
        )}
        {activeTab === "Recruiter" && (
          <div className="flex flex-col gap-4">
            <textarea
              rows={5}
              placeholder="Role Description"
              className="px-4 py-2 rounded-lg bg-white text-gray-900 outline-none border border-gray-200"
              onChange={(e) =>
                setJobDescription((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <textarea
              rows={2}
              placeholder="Required Skills"
              className="px-4 py-2 rounded-lg bg-white text-gray-900 outline-none border border-gray-200"
              onChange={(e) =>
                setJobDescription((prev) => ({
                  ...prev,
                  skills: e.target.value,
                }))
              }
            />

            {/* <input type="file" placeholder='Upload Resume'  /> */}
            <button
              onClick={handleScoreMatch}
              className="w-full bg-purple-600 rounded-full text-white py-2 flex gap-2 items-center justify-center"
            >
              {loading ? (
                <div>
                  <Spinner />
                </div>
              ) : (
                <div></div>
              )}
              Get Score Matches
            </button>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default ToggleSwitch;

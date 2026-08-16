"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";

type FormData = {
  studentName: string;
  dateOfBirth: string;
  gender: string;
  grade: string;
  previousSchool: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  message: string;
};

const initialForm: FormData = {
  studentName: "",
  dateOfBirth: "",
  gender: "",
  grade: "",
  previousSchool: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  address: "",
  message: "",
};

const gradeOptions = [
  { label: "Nursery", value: "nursery" },
  { label: "LKG", value: "lkg" },
  { label: "UKG", value: "ukg" },
  { label: "Grade 1", value: "grade-1" },
  { label: "Grade 2", value: "grade-2" },
  { label: "Grade 3", value: "grade-3" },
  { label: "Grade 4", value: "grade-4" },
  { label: "Grade 5", value: "grade-5" },
  { label: "Grade 6", value: "grade-6" },
  { label: "Grade 7", value: "grade-7" },
  { label: "Grade 8", value: "grade-8" },
  { label: "Grade 9", value: "grade-9" },
  { label: "Grade 10", value: "grade-10" },
];

export default function ApplyPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm(initialForm);
      } else {
        const data = await res.json();
        setErrorMessage(data?.errors?.[0]?.message || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumb />
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">
              Apply Now
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              Begin your child&apos;s journey at Apollo Vidhyalayam. Fill out the form below and our admissions team will get in touch with you.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-6">
            {status === "success" ? (
              <div className="text-center py-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="size-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="mt-6 font-display text-2xl uppercase text-ink-900">Application Submitted</h2>
                <p className="mt-3 text-sm text-ink-600">
                  Thank you for your application. Our admissions team will review it and contact you shortly.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-8 inline-flex items-center rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Student Information */}
                <div>
                  <h2 className="font-display text-xl uppercase text-ink-900">Student Information</h2>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="studentName" className="block text-sm font-semibold text-ink-800">
                        Student Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        required
                        value={form.studentName}
                        onChange={handleChange}
                        className="mt-1.5 w-full border border-line-200 px-4 py-2.5 text-sm text-ink-900 focus:border-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-800"
                      />
                    </div>
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-ink-800">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        required
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        className="mt-1.5 w-full border border-line-200 px-4 py-2.5 text-sm text-ink-900 focus:border-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-800"
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="block text-sm font-semibold text-ink-800">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        required
                        value={form.gender}
                        onChange={handleChange}
                        className="mt-1.5 w-full border border-line-200 px-4 py-2.5 text-sm text-ink-900 focus:border-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-800"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="grade" className="block text-sm font-semibold text-ink-800">
                        Grade Applying For <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="grade"
                        name="grade"
                        required
                        value={form.grade}
                        onChange={handleChange}
                        className="mt-1.5 w-full border border-line-200 px-4 py-2.5 text-sm text-ink-900 focus:border-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-800"
                      >
                        <option value="">Select grade</option>
                        {gradeOptions.map((g) => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="previousSchool" className="block text-sm font-semibold text-ink-800">
                        Previous School (if any)
                      </label>
                      <input
                        type="text"
                        id="previousSchool"
                        name="previousSchool"
                        value={form.previousSchool}
                        onChange={handleChange}
                        className="mt-1.5 w-full border border-line-200 px-4 py-2.5 text-sm text-ink-900 focus:border-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Parent/Guardian Information */}
                <div>
                  <h2 className="font-display text-xl uppercase text-ink-900">Parent / Guardian Information</h2>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="parentName" className="block text-sm font-semibold text-ink-800">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="parentName"
                        name="parentName"
                        required
                        value={form.parentName}
                        onChange={handleChange}
                        className="mt-1.5 w-full border border-line-200 px-4 py-2.5 text-sm text-ink-900 focus:border-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-800"
                      />
                    </div>
                    <div>
                      <label htmlFor="parentPhone" className="block text-sm font-semibold text-ink-800">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="parentPhone"
                        name="parentPhone"
                        required
                        value={form.parentPhone}
                        onChange={handleChange}
                        className="mt-1.5 w-full border border-line-200 px-4 py-2.5 text-sm text-ink-900 focus:border-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-800"
                      />
                    </div>
                    <div>
                      <label htmlFor="parentEmail" className="block text-sm font-semibold text-ink-800">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="parentEmail"
                        name="parentEmail"
                        value={form.parentEmail}
                        onChange={handleChange}
                        className="mt-1.5 w-full border border-line-200 px-4 py-2.5 text-sm text-ink-900 focus:border-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-800"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-semibold text-ink-800">
                        Residential Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        required
                        rows={3}
                        value={form.address}
                        onChange={handleChange}
                        className="mt-1.5 w-full border border-line-200 px-4 py-2.5 text-sm text-ink-900 focus:border-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-800"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="message" className="block text-sm font-semibold text-ink-800">
                        Additional Information
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={3}
                        value={form.message}
                        onChange={handleChange}
                        className="mt-1.5 w-full border border-line-200 px-4 py-2.5 text-sm text-ink-900 focus:border-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {status === "error" && (
                  <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                {/* Submit */}
                <div>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex items-center rounded-full bg-yellow-500 px-8 py-3 text-sm font-bold text-ink-900 transition hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "submitting" ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

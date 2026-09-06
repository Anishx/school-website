"use client";

import { useCallback, useState } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { TurnstileWidget, isCaptchaEnabled } from "@/components/turnstile-widget";

type FormData = {
  // Student Details
  studentFullName: string;
  classApplyingFor: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  category: string;
  aadharNo: string;
  motherTongue: string;
  // Previous School Details
  previousSchoolName: string;
  previousSchoolAddress: string;
  board: string;
  classLastStudied: string;
  transferCertificateNo: string;
  // Parent / Guardian Details
  fatherName: string;
  fatherOccupation: string;
  fatherQualification: string;
  motherName: string;
  motherOccupation: string;
  motherQualification: string;
  contactNumber: string;
  alternateContactNumber: string;
  emailId: string;
  residentialAddress: string;
  permanentAddress: string;
  // Documents Enclosed
  documents: string[];
};

const initialForm: FormData = {
  studentFullName: "",
  classApplyingFor: "",
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  category: "",
  aadharNo: "",
  motherTongue: "",
  previousSchoolName: "",
  previousSchoolAddress: "",
  board: "",
  classLastStudied: "",
  transferCertificateNo: "",
  fatherName: "",
  fatherOccupation: "",
  fatherQualification: "",
  motherName: "",
  motherOccupation: "",
  motherQualification: "",
  contactNumber: "",
  alternateContactNumber: "",
  emailId: "",
  residentialAddress: "",
  permanentAddress: "",
  documents: [],
};

const classOptions = [
  "Nursery", "LKG", "UKG",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
];

const categoryOptions = ["General", "OBC", "SC", "ST", "EWS"];

const documentOptions = [
  "Birth Certificate",
  "Transfer Certificate",
  "Aadhar Card (Student & Parents)",
  "Mark Sheet",
  "Photographs (4)",
  "Mother Bank Passbook",
  "Caste Certificate",
];

type AdmissionApiResponse =
  | { ok: true; reference: string }
  | { ok: false; error?: { message?: string } };

function isAdmissionApiResponse(value: unknown): value is AdmissionApiResponse {
  if (!value || typeof value !== "object" || !("ok" in value)) return false;
  const response = value as Record<string, unknown>;
  return response.ok === true
    ? typeof response.reference === "string"
    : response.ok === false;
}

export function ApplyClient() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleCaptcha = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = (doc: string) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.includes(doc)
        ? prev.documents.filter((d) => d !== doc)
        : [...prev.documents, doc],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCaptchaEnabled && !captchaToken) {
      setErrorMessage("Please complete the captcha before submitting.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captchaToken,
          studentName: form.studentFullName,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          grade: form.classApplyingFor,
          bloodGroup: form.bloodGroup,
          category: form.category,
          aadharNo: form.aadharNo,
          motherTongue: form.motherTongue,
          previousSchool: form.previousSchoolName,
          previousSchoolAddress: form.previousSchoolAddress,
          board: form.board,
          classLastStudied: form.classLastStudied,
          transferCertificateNo: form.transferCertificateNo,
          fatherName: form.fatherName,
          fatherOccupation: form.fatherOccupation,
          fatherQualification: form.fatherQualification,
          motherName: form.motherName,
          motherOccupation: form.motherOccupation,
          motherQualification: form.motherQualification,
          contactNumber: form.contactNumber,
          alternatePhone: form.alternateContactNumber,
          parentEmail: form.emailId,
          address: form.residentialAddress,
          permanentAddress: form.permanentAddress,
          documentsEnclosed: form.documents,
        }),
      });

      const data: unknown = await res.json().catch(() => null);
      if (res.ok && isAdmissionApiResponse(data) && data.ok) {
        setStatus("success");
        setForm(initialForm);
        setCaptchaToken(null);
      } else {
        const message = isAdmissionApiResponse(data) && !data.ok
          ? data.error?.message
          : undefined;
        setErrorMessage(message || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  const inputClass = "mt-1.5 w-full border border-line-200 px-4 py-2.5 text-sm text-ink-900 focus:border-teal-800 focus:outline-none focus:ring-1 focus:ring-teal-800";
  const labelClass = "block text-sm font-semibold text-ink-800";

  return (
    <>
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumb />
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">
              Application Form
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              Begin your child&apos;s journey at Apollo Vidhyalayam. Fill out the form below and our admissions team will get in touch with you.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-4xl">
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
                <Button
                  type="button"
                  variant="teal"
                  size="md"
                  className="mt-8"
                  onClick={() => setStatus("idle")}
                >
                  Submit Another Application
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Student Details */}
                <div>
                  <div className="border-l-4 border-teal-600 pl-4">
                    <h2 className="font-display text-xl uppercase text-ink-900">Student Details</h2>
                  </div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="studentFullName" className={labelClass}>
                        Student&apos;s Full Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" id="studentFullName" name="studentFullName" required value={form.studentFullName} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="classApplyingFor" className={labelClass}>
                        Class Applying For <span className="text-red-500">*</span>
                      </label>
                      <select id="classApplyingFor" name="classApplyingFor" required value={form.classApplyingFor} onChange={handleChange} className={inputClass}>
                        <option value="">Select class</option>
                        {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="dateOfBirth" className={labelClass}>
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input type="date" id="dateOfBirth" name="dateOfBirth" required value={form.dateOfBirth} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="gender" className={labelClass}>
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select id="gender" name="gender" required value={form.gender} onChange={handleChange} className={inputClass}>
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="bloodGroup" className={labelClass}>Blood Group</label>
                      <input type="text" id="bloodGroup" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className={inputClass} placeholder="e.g. O+" />
                    </div>
                    <div>
                      <label htmlFor="category" className={labelClass}>Category (Gen/OBC/SC/ST/EWS)</label>
                      <select id="category" name="category" value={form.category} onChange={handleChange} className={inputClass}>
                        <option value="">Select category</option>
                        {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="aadharNo" className={labelClass}>Aadhar No.</label>
                      <input type="text" id="aadharNo" name="aadharNo" value={form.aadharNo} onChange={handleChange} className={inputClass} placeholder="12-digit Aadhar number" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="motherTongue" className={labelClass}>Mother Tongue / Nationality</label>
                      <input type="text" id="motherTongue" name="motherTongue" value={form.motherTongue} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Previous School Details */}
                <div>
                  <div className="border-l-4 border-teal-600 pl-4">
                    <h2 className="font-display text-xl uppercase text-ink-900">Previous School Details</h2>
                  </div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="previousSchoolName" className={labelClass}>Name of School</label>
                      <input type="text" id="previousSchoolName" name="previousSchoolName" value={form.previousSchoolName} onChange={handleChange} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="previousSchoolAddress" className={labelClass}>School Address</label>
                      <textarea id="previousSchoolAddress" name="previousSchoolAddress" rows={2} value={form.previousSchoolAddress} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="board" className={labelClass}>Board</label>
                      <input type="text" id="board" name="board" value={form.board} onChange={handleChange} className={inputClass} placeholder="e.g. CBSE, State Board" />
                    </div>
                    <div>
                      <label htmlFor="classLastStudied" className={labelClass}>Class Last Studied</label>
                      <input type="text" id="classLastStudied" name="classLastStudied" value={form.classLastStudied} onChange={handleChange} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="transferCertificateNo" className={labelClass}>Transfer Certificate No.</label>
                      <input type="text" id="transferCertificateNo" name="transferCertificateNo" value={form.transferCertificateNo} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Parent / Guardian Details */}
                <div>
                  <div className="border-l-4 border-teal-600 pl-4">
                    <h2 className="font-display text-xl uppercase text-ink-900">Parent / Guardian Details</h2>
                  </div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="fatherName" className={labelClass}>Father&apos;s Name <span className="text-red-500">*</span></label>
                      <input type="text" id="fatherName" name="fatherName" required value={form.fatherName} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="fatherOccupation" className={labelClass}>Occupation</label>
                      <input type="text" id="fatherOccupation" name="fatherOccupation" value={form.fatherOccupation} onChange={handleChange} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="fatherQualification" className={labelClass}>Educational Qualification</label>
                      <input type="text" id="fatherQualification" name="fatherQualification" value={form.fatherQualification} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="motherName" className={labelClass}>Mother&apos;s Name <span className="text-red-500">*</span></label>
                      <input type="text" id="motherName" name="motherName" required value={form.motherName} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="motherOccupation" className={labelClass}>Occupation</label>
                      <input type="text" id="motherOccupation" name="motherOccupation" value={form.motherOccupation} onChange={handleChange} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="motherQualification" className={labelClass}>Educational Qualification</label>
                      <input type="text" id="motherQualification" name="motherQualification" value={form.motherQualification} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="contactNumber" className={labelClass}>Contact Number <span className="text-red-500">*</span></label>
                      <input type="tel" id="contactNumber" name="contactNumber" required value={form.contactNumber} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="emailId" className={labelClass}>Email ID</label>
                      <input type="email" id="emailId" name="emailId" value={form.emailId} onChange={handleChange} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="alternateContactNumber" className={labelClass}>Alternate Contact Number</label>
                      <input type="tel" id="alternateContactNumber" name="alternateContactNumber" value={form.alternateContactNumber} onChange={handleChange} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="residentialAddress" className={labelClass}>Residential Address <span className="text-red-500">*</span></label>
                      <textarea id="residentialAddress" name="residentialAddress" required rows={3} value={form.residentialAddress} onChange={handleChange} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="permanentAddress" className={labelClass}>Permanent Address</label>
                      <textarea id="permanentAddress" name="permanentAddress" rows={3} value={form.permanentAddress} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Documents Enclosed */}
                <div>
                  <div className="border-l-4 border-teal-600 pl-4">
                    <h2 className="font-display text-xl uppercase text-ink-900">Documents Enclosed</h2>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                    {documentOptions.map((doc) => (
                      <label key={doc} className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.documents.includes(doc)}
                          onChange={() => handleCheckbox(doc)}
                          className="h-4 w-4 border-line-200 text-teal-800 focus:ring-teal-800"
                        />
                        {doc}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Declaration */}
                <div className="border-t border-line-200 pt-6">
                  <p className="text-sm italic text-teal-800">
                    Declaration: I confirm that the details furnished above are true and correct.
                  </p>
                </div>

                {/* Captcha */}
                {isCaptchaEnabled && (
                  <div>
                    <TurnstileWidget onVerify={handleCaptcha} action="admission" />
                  </div>
                )}

                {/* Error message */}
                {status === "error" && (
                  <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                {/* Submit */}
                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="font-bold"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

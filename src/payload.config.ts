import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users",
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: "users",
      auth: true,
      admin: {
        useAsTitle: "email",
      },
      fields: [
        {
          name: "name",
          type: "text",
        },
        {
          name: "role",
          type: "select",
          options: [
            { label: "Admin", value: "admin" },
            { label: "Staff", value: "staff" },
          ],
          defaultValue: "staff",
        },
      ],
    },
    {
      slug: "admissions",
      access: {
        create: () => true,
      },
      admin: {
        useAsTitle: "studentName",
        defaultColumns: ["studentName", "grade", "fatherName", "contactNumber", "createdAt"],
      },
      fields: [
        // Student Details
        { name: "studentName", type: "text", required: true, label: "Student Full Name" },
        { name: "grade", type: "text", required: true, label: "Class Applying For" },
        { name: "dateOfBirth", type: "date", required: true, label: "Date of Birth" },
        { name: "gender", type: "select", required: true, options: [
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
          { label: "Other", value: "other" },
        ]},
        { name: "bloodGroup", type: "text", label: "Blood Group" },
        { name: "category", type: "text", label: "Category (Gen/OBC/SC/ST/EWS)" },
        { name: "aadharNo", type: "text", label: "Aadhar No." },
        { name: "motherTongue", type: "text", label: "Mother Tongue / Nationality" },
        // Previous School Details
        { name: "previousSchool", type: "text", label: "Previous School Name" },
        { name: "previousSchoolAddress", type: "textarea", label: "Previous School Address" },
        { name: "board", type: "text", label: "Board" },
        { name: "classLastStudied", type: "text", label: "Class Last Studied" },
        { name: "transferCertificateNo", type: "text", label: "Transfer Certificate No." },
        // Parent / Guardian Details
        { name: "fatherName", type: "text", required: true, label: "Father's Name" },
        { name: "fatherOccupation", type: "text", label: "Father's Occupation" },
        { name: "fatherQualification", type: "text", label: "Father's Qualification" },
        { name: "motherName", type: "text", required: true, label: "Mother's Name" },
        { name: "motherOccupation", type: "text", label: "Mother's Occupation" },
        { name: "motherQualification", type: "text", label: "Mother's Qualification" },
        { name: "contactNumber", type: "text", required: true, label: "Contact Number" },
        { name: "alternatePhone", type: "text", label: "Alternate Contact Number" },
        { name: "parentEmail", type: "email", label: "Email ID" },
        { name: "address", type: "textarea", required: true, label: "Residential Address" },
        { name: "permanentAddress", type: "textarea", label: "Permanent Address" },
        // Documents
        { name: "documentsEnclosed", type: "json", label: "Documents Enclosed" },
        // Status
        {
          name: "status",
          type: "select",
          defaultValue: "pending",
          admin: { position: "sidebar" },
          options: [
            { label: "Pending", value: "pending" },
            { label: "Reviewed", value: "reviewed" },
            { label: "Accepted", value: "accepted" },
            { label: "Rejected", value: "rejected" },
          ],
        },
      ],
      hooks: {
        afterChange: [
          async ({ doc, operation, req }) => {
            if (operation === "create" && req.payload) {
              try {
                await req.payload.sendEmail({
                  to: process.env.ADMISSION_NOTIFICATION_EMAIL || "admin@apollovidhyalayam.com",
                  subject: `New Admission Application - ${doc.studentName}`,
                  html: `
                    <h2>New Admission Application Received</h2>
                    <h3>Student Details</h3>
                    <p><strong>Student Name:</strong> ${doc.studentName}</p>
                    <p><strong>Class Applying For:</strong> ${doc.grade}</p>
                    <p><strong>Date of Birth:</strong> ${doc.dateOfBirth}</p>
                    <p><strong>Gender:</strong> ${doc.gender}</p>
                    <p><strong>Blood Group:</strong> ${doc.bloodGroup || "N/A"}</p>
                    <p><strong>Category:</strong> ${doc.category || "N/A"}</p>
                    <p><strong>Aadhar No.:</strong> ${doc.aadharNo || "N/A"}</p>
                    <h3>Previous School</h3>
                    <p><strong>School:</strong> ${doc.previousSchool || "N/A"}</p>
                    <p><strong>Board:</strong> ${doc.board || "N/A"}</p>
                    <p><strong>Class Last Studied:</strong> ${doc.classLastStudied || "N/A"}</p>
                    <h3>Parent / Guardian Details</h3>
                    <p><strong>Father:</strong> ${doc.fatherName} (${doc.fatherOccupation || "N/A"})</p>
                    <p><strong>Mother:</strong> ${doc.motherName} (${doc.motherOccupation || "N/A"})</p>
                    <p><strong>Contact:</strong> ${doc.contactNumber}</p>
                    <p><strong>Email:</strong> ${doc.parentEmail || "Not provided"}</p>
                    <p><strong>Address:</strong> ${doc.address}</p>
                    <hr />
                    <p><em>Submitted via Apollo Vidhyalayam website.</em></p>
                  `,
                });
              } catch (error) {
                console.error("Failed to send admission notification email:", error);
              }
            }
          },
        ],
      },
    },
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "default-secret-change-me-in-production",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
      ssl: { rejectUnauthorized: false },
    },
  }),
  ...(process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.SMTP_FROM_EMAIL || "noreply@apollovidhyalayam.com",
          defaultFromName: "Apollo Vidhyalayam",
          transportOptions: {
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          },
        }),
      }
    : {}),
});

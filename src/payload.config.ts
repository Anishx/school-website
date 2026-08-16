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
      admin: {
        useAsTitle: "studentName",
        defaultColumns: ["studentName", "grade", "parentName", "createdAt"],
      },
      fields: [
        {
          name: "studentName",
          type: "text",
          required: true,
          label: "Student Name",
        },
        {
          name: "dateOfBirth",
          type: "date",
          required: true,
          label: "Date of Birth",
        },
        {
          name: "gender",
          type: "select",
          required: true,
          options: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Other", value: "other" },
          ],
        },
        {
          name: "grade",
          type: "select",
          required: true,
          label: "Grade Applying For",
          options: [
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
          ],
        },
        {
          name: "previousSchool",
          type: "text",
          label: "Previous School (if any)",
        },
        {
          name: "parentName",
          type: "text",
          required: true,
          label: "Parent/Guardian Name",
        },
        {
          name: "parentPhone",
          type: "text",
          required: true,
          label: "Phone Number",
        },
        {
          name: "parentEmail",
          type: "email",
          label: "Email Address",
        },
        {
          name: "address",
          type: "textarea",
          required: true,
          label: "Residential Address",
        },
        {
          name: "message",
          type: "textarea",
          label: "Additional Information",
        },
        {
          name: "status",
          type: "select",
          defaultValue: "pending",
          admin: {
            position: "sidebar",
          },
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
                    <p><strong>Student Name:</strong> ${doc.studentName}</p>
                    <p><strong>Grade:</strong> ${doc.grade}</p>
                    <p><strong>Parent/Guardian:</strong> ${doc.parentName}</p>
                    <p><strong>Phone:</strong> ${doc.parentPhone}</p>
                    <p><strong>Email:</strong> ${doc.parentEmail || "Not provided"}</p>
                    <p><strong>Address:</strong> ${doc.address}</p>
                    <p><strong>Previous School:</strong> ${doc.previousSchool || "N/A"}</p>
                    <p><strong>Message:</strong> ${doc.message || "None"}</p>
                    <hr />
                    <p><em>This application was submitted via the Apollo Vidhyalayam website.</em></p>
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
    },
  }),
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM_EMAIL || "noreply@apollovidhyalayam.com",
    defaultFromName: "Apollo Vidhyalayam",
    transportOptions: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    },
  }),
});

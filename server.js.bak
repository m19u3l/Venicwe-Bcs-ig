// --- Imports ---
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import pdfkit from "pdfkit";
import nodemailer from "nodemailer";

// --- ESM __dirname hack ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Import Routers ---
import clientsRouter from "./routes/clients.js";
import invoicesRouter from "./routes/invoices.js";
import estimatesRouter from "./routes/estimates.js";
import workOrdersRouter from "./routes/work-orders.js";
import changeOrdersRouter from "./routes/change-orders.js";
import jobTrackingRouter from "./routes/job-tracking.js";
import lineItemsRoutes from './routes/line_items.js';
import materialsRouter from "./routes/materials.js";
import equipmentRouter from "./routes/equipment.js";
import toolsRouter from "./routes/tools.js";
import employeesRouter from "./routes/employees.js";
import vendorsRouter from "./routes/vendors.js";
import remediationDryoutRouter from "./routes/remediation-dryout.js";
import remediationReconstructionRouter from "./routes/remediation-reconstruction.js";
import settingsRouter from "./routes/settings.js";
import reportsRouter from "./routes/reports.js";
import dashboardRouter from "./routes/dashboard.js";

// --- App Setup ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

// --- SQLite Setup ---
const dbPromise = open({
  filename: path.join(__dirname, "invoice.db"),
  driver: sqlite3.Database,
});

// --- Nodemailer Setup ---
const transporter = nodemailer.createTransport({
  host: "smtp.ionos.com",
  port: 587,
  secure: false,
  auth: {
    user: "m19u3l@sd-bcs.com",
    pass: "Psswrd2025!"
  }
});

async function sendInvoiceEmail(to, subject, text, attachmentBuffer, filename) {
  await transporter.sendMail({
    from: '"Miguel" <m19u3l@sd-bcs.com>',
    to,
    subject,
    text,
    attachments: [{ filename, content: attachmentBuffer }]
  });
}

// --- PDF Generator Route ---
app.get("/api/invoices/:invoiceId/pdf", async (req, res) => {
  const { invoiceId } = req.params;
  try {
    const db = await dbPromise;

    const invoice = await db.get("SELECT * FROM invoices WHERE id = ?", [invoiceId]);
    const lineItems = await db.all("SELECT * FROM line_items WHERE invoice_id = ?", [invoiceId]);

    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const doc = new pdfkit();
    const filename = `invoice_${invoiceId}.pdf`;

    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(25).text("Invoice", { align: "center" }).moveDown();
    doc.fontSize(12)
      .text(`Invoice Number: ${invoice.invoice_number}`)
      .text(`Date: ${invoice.date_of_issue}`)
      .text(`Due Date: ${invoice.due_date}`)
      .text(`Client: ${invoice.client_name}`)
      .text(`Address: ${invoice.client_address}`)
      .moveDown();

    doc.fontSize(14).text("Line Items:").moveDown();
    lineItems.forEach(item => {
      doc.text(`Category: ${item.category}`)
        .text(`Description: ${item.description}`)
        .text(`Quantity: ${item.quantity}`)
        .text(`Rate: ${item.rate}`)
        .text(`Total: ${item.total}`)
        .moveDown();
    });

    doc.moveDown()
      .text("Thank you for your business!", { align: "center" })
      .moveDown()
      .text("Client Contract Responsibilities:")
      .text("Late fee payment of 5% per month after due date.")
      .text("In case of dispute, client responsible for legal fees.")
      .text("Warranty on workmanship for 12 months.")
      .text("Deposit of 20% before work begins.")
      .text("Repairs not mentioned are $85/hr plus materials and travel.")
      .text("Designated bathroom release area responsibility.")
      .text("Other legal disclosures as required.")
      .moveDown()
      .text("Work Authorization:")
      .text("I, the undersigned, authorize the above-described work to be performed and agree to all terms.")
      .text("Client Signature: ________________________ Date: ___________")
      .moveDown()
      .text("Quotes valid for 20 days and subject to change with supply costs.")
      .moveDown()
      .text("Legal Disclosures:")
      .text("This invoice is a binding agreement. Changes require written consent. Provider not responsible for uncontrollable events.");

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating PDF" });
  }
});

// --- Email Invoice Route ---
app.post("/api/invoices/:invoiceId/email", async (req, res) => {
  const { invoiceId } = req.params;
  const { clientEmail } = req.body;

  try {
    const db = await dbPromise;

    const invoice = await db.get("SELECT * FROM invoices WHERE id = ?", [invoiceId]);
    const lineItems = await db.all("SELECT * FROM line_items WHERE invoice_id = ?", [invoiceId]);

    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const doc = new pdfkit();
    const chunks = [];
    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);
      await sendInvoiceEmail(
        clientEmail,
        `Invoice #${invoiceId}`,
        "Please find your invoice attached.",
        pdfBuffer,
        `invoice_${invoiceId}.pdf`
      );
      res.status(200).json({ message: "Invoice emailed successfully" });
    });

    doc.fontSize(25).text("Invoice", { align: "center" }).moveDown();
    doc.text(`Invoice Number: ${invoice.invoice_number}`);
    doc.text(`Client: ${invoice.client_name}`).moveDown();
    lineItems.forEach(item => {
      doc.text(`${item.description} - $${item.total}`);
    });
    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending invoice email" });
  }
});

// --- Mount Routers ---
app.use("/api/clients", clientsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/estimates", estimatesRouter);
app.use("/api/work-orders", workOrdersRouter);
app.use("/api/change-orders", changeOrdersRouter);
app.use("/api/job-tracking", jobTrackingRouter);
app.use("/api/line-items", lineItemsRoutes);
app.use("/api/materials", materialsRouter);
app.use("/api/equipment", equipmentRouter);
app.use("/api/tools", toolsRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/remediation/dryout", remediationDryoutRouter);
app.use("/api/remediation/reconstruction", remediationReconstructionRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/dashboard", dashboardRouter);

// --- Serve Frontend ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// --- Start Server ---
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

import PDFDocument from "pdfkit";
import fs from "fs";
import { IQuestionPaper } from "../models/QuestionPaper";
import { IAssignment } from "../models/Assignment";

function difficultyLabel(d: string): string {
  if (d === "easy") return "Easy";
  if (d === "medium") return "Moderate";
  return "Challenging";
}

export async function generatePDF(
  paper: IQuestionPaper,
  assignment: IAssignment,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 55, right: 55 },
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const pw = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // ── School Header ──
    doc.fontSize(16).font("Helvetica-Bold").text(
      "Delhi Public School, Sector-4, Bokaro",
      doc.page.margins.left, 45,
      { align: "center", width: pw }
    );
    doc.fontSize(11).font("Helvetica").text(
      "First Terminal Examination, 2025-26",
      { align: "center", width: pw }
    );
    doc.moveDown(1.5);

    // ── Subject & Class row ──
    doc.fontSize(11).font("Helvetica-Bold");
    const subject = paper.subject || assignment.subject || "General";
    const className = paper.className || assignment.className || "";
    doc.text(`Subject  :  ${subject}`, doc.page.margins.left, doc.y, { continued: true });
    if (className) {
      doc.text(`                                             Class  :  ${className}`, { align: "right", width: pw });
    }
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica");
    doc.text(`Time Allowed  :  45 Minutes                                                                        Maximum Marks  :  ${assignment.totalMarks}`, { width: pw });
    doc.moveDown(1);

    // ── Student Info ──
    doc.fontSize(11).font("Helvetica");
    const lineLen = 120;
    doc.text("Name  :  _______________________________", doc.page.margins.left, doc.y, { continued: true });
    doc.text("                                           Roll Number  :  ___________", { align: "right", width: pw });
    doc.moveDown(0.5);
    doc.text(`Class  :  ${className || "___________"}`, doc.page.margins.left, doc.y, { continued: true });
    doc.text("                                           Section  :  ___________", { align: "right", width: pw });
    doc.moveDown(1.5);

    // ── General Instructions ──
    if (assignment.instructions) {
      doc.fontSize(9).font("Helvetica-Oblique").text(
        `General Instructions  :  ${assignment.instructions}`,
        doc.page.margins.left, doc.y,
        { width: pw }
      );
      doc.moveDown(1);
    }

    // ── Divider ──
    doc.moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.margins.left + pw, doc.y)
      .stroke("#bbb");
    doc.moveDown(1);

    // ── Sections ──
    for (let sIdx = 0; sIdx < paper.sections.length; sIdx++) {
      const section = paper.sections[sIdx];

      doc.fontSize(12).font("Helvetica-Bold").text(section.title);
      doc.fontSize(9).font("Helvetica-Oblique").text(section.instruction, { width: pw });
      doc.moveDown(0.5);

      for (const q of section.questions) {
        const label = difficultyLabel(q.difficulty);
        doc.fontSize(10).font("Helvetica-Bold")
          .text(`${q.number}. `, doc.page.margins.left, doc.y, { continued: true });

        doc.font("Helvetica").text(`${q.text}`, { width: pw - 80, continued: false });
        doc.moveDown(0.1);

        const tagY = doc.y;
        doc.fontSize(8).font("Helvetica-Bold")
          .fillColor("#16a34a").text(`[${label}]  `, doc.page.margins.left + 25, tagY, { continued: true });
        doc.fillColor("#555").font("Helvetica")
          .text(`[${q.marks} Marks]`);
        doc.fillColor("#000");
        doc.moveDown(0.5);
      }

      if (sIdx < paper.sections.length - 1) {
        doc.moveDown(0.3);
        doc.moveTo(doc.page.margins.left, doc.y)
          .lineTo(doc.page.margins.left + pw, doc.y)
          .stroke("#ddd");
        doc.moveDown(0.3);
      }
    }

    // ── End of Question Paper ──
    doc.moveDown(1);
    doc.fontSize(11).font("Helvetica-Bold")
      .text("- End of Question Paper -", doc.page.margins.left, doc.y, { align: "center", width: pw });

    // ── Answer Key ──
    if (paper.answerKey && paper.answerKey.length > 0) {
      doc.addPage();
      doc.fontSize(16).font("Helvetica-Bold")
        .text("Answer Key", doc.page.margins.left, 50, { align: "center", width: pw });
      doc.moveDown(1.5);

      doc.fontSize(10).font("Helvetica");
      for (const ans of paper.answerKey) {
        doc.text(ans, doc.page.margins.left, doc.y, { width: pw });
        doc.moveDown(0.5);
      }
    }

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

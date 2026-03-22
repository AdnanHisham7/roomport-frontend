import PDFDocument from 'pdfkit';
import fs          from 'fs';
import path        from 'path';
import { fileURLToPath } from 'url';


export interface AgreementPdfData {
  agreementId:       string;
  title:             string;
  body:              string;
  terms?:            string;
  tenantName:        string;
  tenantEmail:       string;
  propertyName:      string;
  monthlyRent:       number;
  startDate:         Date;
  endDate:           Date;
  typedSignatureName: string;
  signedAt:          Date;
  verifiedAt:        Date;
  completedAt:       Date;
  signerIp?:         string;
}

export class PdfService {
  private readonly outputDir: string;

  constructor() {
    // In production replace with S3/Cloudinary upload
    this.outputDir = path.join(__dirname, '..', '..', '..', 'uploads', 'agreements');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateAgreementPdf(data: AgreementPdfData): Promise<string> {
    return new Promise((resolve, reject) => {
      const filename  = `agreement_${data.agreementId}_${Date.now()}.pdf`;
      const filepath  = path.join(this.outputDir, filename);
      const fileUrl   = `/uploads/agreements/${filename}`;  // serve statically

      const doc = new PDFDocument({ margin: 60, size: 'A4' });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // ── Header ──────────────────────────────────────────────────────────────
      doc
        .fontSize(20).font('Helvetica-Bold')
        .text('DIGITAL RENTAL AGREEMENT', { align: 'center' })
        .moveDown(0.3);

      doc
        .fontSize(10).font('Helvetica')
        .fillColor('#555')
        .text(`Agreement ID: ${data.agreementId}`, { align: 'center' })
        .text(`Generated: ${new Date().toISOString()}`, { align: 'center' })
        .fillColor('#000')
        .moveDown(1.5);

      // ── Title ────────────────────────────────────────────────────────────────
      doc
        .fontSize(14).font('Helvetica-Bold')
        .text(data.title)
        .moveDown(0.5);

      // ── Property & Rent Details ───────────────────────────────────────────────
      doc
        .fontSize(11).font('Helvetica-Bold').text('AGREEMENT DETAILS')
        .moveDown(0.3);

      doc.fontSize(10).font('Helvetica');
      const details = [
        ['Property',      data.propertyName],
        ['Tenant',        data.tenantName],
        ['Monthly Rent',  `₹${data.monthlyRent.toLocaleString()}`],
        ['Start Date',    data.startDate.toDateString()],
        ['End Date',      data.endDate.toDateString()],
      ];
      details.forEach(([label, value]) => {
        doc.text(`${label}: `, { continued: true }).font('Helvetica-Bold').text(value).font('Helvetica');
      });

      doc.moveDown(1);

      // ── Body ─────────────────────────────────────────────────────────────────
      doc
        .fontSize(11).font('Helvetica-Bold').text('AGREEMENT TERMS & CONDITIONS')
        .moveDown(0.3)
        .fontSize(10).font('Helvetica')
        .text(data.body, { align: 'justify' })
        .moveDown(1);

      if (data.terms) {
        doc
          .fontSize(11).font('Helvetica-Bold').text('KEY TERMS SUMMARY')
          .moveDown(0.3)
          .fontSize(10).font('Helvetica')
          .text(data.terms, { align: 'justify' })
          .moveDown(1);
      }

      // ── Digital Signature Block ───────────────────────────────────────────────
      doc
        .fontSize(11).font('Helvetica-Bold').text('DIGITAL SIGNATURE')
        .moveDown(0.3);

      doc
        .rect(doc.x, doc.y, 480, 80)
        .strokeColor('#cccccc').stroke()
        .moveDown(0.3);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Signed by:  ${data.typedSignatureName}`, { indent: 10 });
      doc.text(`Date/Time:  ${data.signedAt.toISOString()}`, { indent: 10 });
      doc.text(`OTP Verified: ${data.verifiedAt.toISOString()}`, { indent: 10 });
      doc.text(`Tenant Email: ${data.tenantEmail}`, { indent: 10 });
      if (data.signerIp) doc.text(`IP Address: ${data.signerIp}`, { indent: 10 });

      doc.moveDown(1.5);

      // ── Completion Stamp ─────────────────────────────────────────────────────
      doc
        .rect(50, doc.y, 495, 40)
        .fillColor('#f0f7f0').fill()
        .fillColor('#000');

      doc
        .fontSize(10).font('Helvetica-Bold')
        .text(
          `✓ DIGITALLY VERIFIED & COMPLETED ON ${data.completedAt.toISOString()}`,
          60, doc.y - 35,
          { align: 'center' }
        );

      doc.end();

      stream.on('finish', () => resolve(fileUrl));
      stream.on('error',  reject);
    });
  }
}

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generatePrescriptionPDF = async (
  data: {
    doctorName: string;
    appointmentId: string;
    petName: string;
    petSpecies: string;
    petAge: string;
    medications: string;
    instructions: string;
  },
  fileName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    const fontPath = path.join(__dirname, '../public/fonts/Roboto/Roboto-Regular.ttf');
    doc.registerFont('Roboto', fontPath);
    doc.font('Roboto');

    const filePath = path.join(__dirname, `../public/prescriptions/${fileName}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('TOA THUỐC CHO THÚ CƯNG', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Bác sĩ: ${data.doctorName}`);
    doc.text(`Ngày kê đơn: ${new Date().toLocaleDateString('vi-VN')}`);
    doc.text(`Mã cuộc hẹn: ${data.appointmentId}`);
    doc.moveDown();

    doc.fontSize(14).text(`Tên thú cưng: ${data.petName}`);
    doc.text(`Giống loài: ${data.petSpecies}`);
    doc.text(`Tuổi: ${data.petAge}`);
    doc.moveDown();

    doc.fontSize(16).text('Danh sách thuốc:', { underline: true });
    doc.fontSize(14).text(data.medications);
    doc.moveDown();

    doc.fontSize(16).text('Hướng dẫn sử dụng:', { underline: true });
    doc.fontSize(14).text(data.instructions);

    doc.end();

    stream.on('finish', () => resolve(`/public/prescriptions/${fileName}.pdf`));
    stream.on('error', reject);
  });
};

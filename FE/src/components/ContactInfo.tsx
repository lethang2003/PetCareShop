// components/ContactInfo.tsx
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function ContactInfo() {
  return (
    <div className="flex flex-col md:flex-row items-start gap-8 p-6 ">
      <div className="w-full md:w-2/3 h-[450px]">
        <iframe
          className="w-full h-full shadow"
           src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.053354565303!2d105.7275660453972!3d10.012451764628613!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0882139720a77%3A0x3916a227d0b95a64!2sFPT%20University!5e0!3m2!1svi!2s!4v1746200790754!5m2!1svi!2s"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Contact Details */}
      <div className="w-full md:w-1/3 space-y-6">
        <h2 className="text-2xl font-bold text-blue-600">Thông Tin Liên Hệ</h2>

        <div className="flex items-start gap-4">
          <PhoneInTalkIcon className="text-blue-500" />
          <div>
            <p className="text-gray-500 text-sm">SỐ KHẨN CẤP</p>
            <p className="font-semibold text-black">0358343799</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <SupportAgentIcon className="text-blue-500" />
          <div>
            <p className="text-gray-500 text-sm">CHĂM SÓC KHÁCH HÀNG</p>
            <p className="font-semibold text-black">1800 9999</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <EmailIcon className="text-blue-500" />
          <div>
            <p className="text-gray-500 text-sm">EMAIL</p>
            <p className="font-semibold text-black">petwellsu25@gmail.com</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <CalendarMonthIcon className="text-blue-500" />
          <div>
            <p className="text-gray-500 text-sm">GIỜ LÀM VIỆC</p>
            <p className="font-semibold text-black">
              Thứ 2 - Chủ nhật: Sáng 08h00 - 12h00, Chiều 14h00 - 19h00
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

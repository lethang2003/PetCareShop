// pages/contact.tsx

import ContactInfo from "../components/ContactInfo";

export default function ContactPage() {
  return (
    <>
      <h2>
        <title>Liên Hệ - Thú Y PETPRO</title>
      </h2>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <ContactInfo />
        </div>
      </div>
    </>
  );
}

import React from "react";

const BookkeepingServicesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Bookkeeping Services สำนักงานบัญชี
      </h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">บริการของเรา</h2>
        <img
          className="h-auto mx-auto my-10 object-cover"
          src="/images/book.png"
          alt="Bookkeeping Services"
          width={800}
          height={300}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          สนใจขอรายละเอียดและใบเสนอราคา
        </h2>
        <p className="text-lg">
          ติดต่อได้ที่:{" "}
          <a href="tel:089-113-8565" className="text-blue-600 hover:underline">
            089-113-8565
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">วิธีการชำระเงิน</h2>
        <p className="mb-2">โอนเข้าบัญชี</p>
        <p className="font-semibold">
          ชื่อบัญชี: บริษัท เอ็มแท็กซ์ บัญชีออนไลน์ จำกัด
        </p>
        <ul className="list-disc pl-6 space-y-4 mt-2">
          <li>
            <p className="font-medium">ธนาคารกสิกรไทย จำกัด (มหาชน)</p>
            <p>สาขาเซ็นทรัลรัตนาธิเบศร์</p>
            <p>เลขที่บัญชี 391-2-74069-1</p>
          </li>
          <li>
            <p className="font-medium">ธนาคารกรุงเทพ จำกัด (มหาชน)</p>
            <p>สาขาเซ็นทรัลรัตนาธิเบศร์</p>
            <p>เลขที่บัญชี 924-0-08255-3</p>
          </li>
        </ul>
        <img
          className="h-auto my-10 object-cover"
          src="/images/qrcode.png"
          alt="Business Startup"
          width={300}
          height={300}
        />
      </section>
    </div>
  );
};

export default BookkeepingServicesPage;

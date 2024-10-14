import React from "react";

const BusinessStartupPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Business Startup รับจัดตั้งธุรกิจ จดทะเบียนธุรกิจ
      </h1>

      <section className="mb-8">
        <img className="mx-auto h-auto my-10 object-cover" src="/images/busines.png" alt="Business Startup" width={300} height={300} />
        <h2 className="text-2xl font-semibold mb-4">บริการของเรา</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>รับจัดตั้งบริษัทและนิติบุคคล</li>
          <li>เตรียมแบบฟอร์มสำหรับใช้งานธุรกิจ</li>
          <li>แนะนำแผนธุรกิจเบื้องต้นสำหรับผู้ประกอบการใหม่</li>
          <li>ให้คำปรึกษาด้านกฎหมายการค้าที่สำคัญกับกิจการ</li>
          <li>รับเปลี่ยนแปลงนิติบุคคลเดิม:
            <ul className="list-circle pl-6 mt-2">
              <li>การเพิ่มทุน</li>
              <li>การเปลี่ยนอำนาจกรรมการ</li>
              <li>การเปลี่ยนชื่อบริษัท</li>
              <li>การเปลี่ยนวัตถุประสงค์ของกิจการ</li>
              <li>การจดทะเบียนภาษีมูลค่าเพิ่ม</li>
            </ul>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">สนใจขอรายละเอียดและใบเสนอราคา</h2>
        <p className="text-lg">
          ติดต่อได้ที่: <a href="tel:089-113-8565" className="text-blue-600 hover:underline">089-113-8565</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">วิธีการชำระเงิน</h2>
        <p className="mb-2">โอนเข้าบัญชี</p>
        <p className="font-semibold">ชื่อบัญชี: บริษัท เอ็มแท็กซ์ บัญชีออนไลน์ จำกัด</p>
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
        <img className="h-auto my-10 object-cover" src="/images/qrcode.png" alt="Business Startup" width={300} height={300} />
      </section>
    </div>
  );
};

export default BusinessStartupPage;

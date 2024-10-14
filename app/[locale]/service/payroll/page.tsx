import React from "react";

const PayrollOutsourcingPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Payroll Outsourcing บัญชีเงินเดือนภายนอก
      </h1>

      <section className="mb-8">
        <img className="mx-auto h-auto my-10 object-cover" src="/images/payroll_service.png" alt="Payroll Outsourcing" width={300} height={300} />
        <h2 className="text-2xl font-semibold mb-4">ขอบเขตการให้บริการ</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Personnel data management:</strong> บริการจัดเก็บและติดตามความเปลี่ยนแปลงข้อมูลพนักงานตลอดระยะเวลาการจ้างงาน</li>
          <li><strong>Payroll Service:</strong> บริการจัดทำเงินเดือนพนักงาน คำนวณภาษี และจัดทำรายงานเพื่อส่งกรมสรรพากร, ประกันสังคม, ธนาคาร และกองทุนสำรองเลี้ยงชีพ</li>
          <li><strong>Employee's attendance and leave management:</strong> บริการจัดเก็บและบริหารข้อมูลเวลาการทำงานของพนักงาน รวมถึงการคำนวณรายได้และส่วนหักที่เกี่ยวกับเวลาทำงาน</li>
          <li><strong>Benefit management:</strong> บริการบริหารการจ่ายสวัสดิการทุกประเภทของพนักงาน</li>
          <li><strong>Performance appraisal:</strong> บริการจัดเก็บข้อมูลการประเมินผลการทำงานของพนักงาน หรือการขึ้นเงินเดือนและการจ่ายโบนัส</li>
          <li><strong>Training & development management:</strong> บริการจัดเก็บและติดตามความเปลี่ยนแปลงของข้อมูลการฝึกอบรมพนักงานและผลการประเมินหลังการอบรม พร้อมจัดทำรายงานส่งกรมพัฒนาฝีมือแรงงาน</li>
          <li><strong>Dashboard:</strong> นำข้อมูลเงินเดือนมาขึ้นกราฟ เพื่อให้เห็นภาพกว้างมากขึ้น</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">นโยบายบริษัท</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>รักษาความลับเป็นสำคัญโดยมีสัญญารักษาความลับลูกค้าและสัญญาให้บริการแยกจากกัน</li>
          <li>ให้บริการถูกต้อง แม่นยำ ตรงต่อเวลา</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">สนใจขอรายละเอียดและใบเสนอราคา</h2>
        <p className="text-lg">
          ติดต่อได้ที่: <a href="tel:089-113-8565" className="text-blue-600 hover:underline">089-113-8565</a>
        </p>
      </section>
    </div>
  );
};

export default PayrollOutsourcingPage;
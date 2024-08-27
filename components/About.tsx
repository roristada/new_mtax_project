import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const About = () => {
  const [clientRendered, setClientRendered] = useState(false);

  useEffect(() => {
    setClientRendered(true);
  }, []);

  

  return (
    <section id="about" className="container mx-auto my-10">
      <h3 className="flex justify-center opacity-40">About us</h3>
      <h1 className="flex justify-center text-4xl font-bold opacity-80 mt-3">Our Company</h1>

      <div className="flex justify-between items-center mt-12 px-5">
        
        {clientRendered && (
          <div className="w-[50%] flex-col">
            <h1 className="text-4xl mb-4 text-[#DA0C81]">
              Mtax
              <span className="text-[#687EFF]"> Online Accounting: Payroll Outsourcing</span>
            </h1>
            <p>
              สำนักงานก่อตั้งเมื่อปี 2539 ในนาม สำนักงานบัญชี เอ็ม.แท็ค.แอนด์ โซลูชั่น ในรูปแบบคณะบุคคล <br />
              ในปี 2548 ได้เปลี่ยนแปลงเป็นนิติบุคคล ในนามบริษัท เอ็มแท็กซ์ บัญชีออนไลน์ จำกัด ทุนจดทะเบียน 1.0 ล้านบาท
              <br />
              <span className="font-semibold underline">นโยบายและพันธกิจของบริษัท</span>
              <br />
              1. รักษาความลับลูกค้าโดยเคร่งครัด <br />
              2. รักษาบริการมาตรฐานแห่งวิชาชีพ <br />
              3. ให้บริการลูกค้าด้วยความถูกต้องแม่นยำโดยยึดถือเอกสารหลักฐานเป็นสำคัญ <br />
              4. ให้ถือหลักการทำงานเสมือนสำนักงานเป็นส่วนหนึ่งของทีมเดียวกับธุรกิจของท่าน <br />
              <span className="font-semibold underline">เป้าหมาย</span>
              <br />
              เป็นสำนักงานบัญชีรูปแบบสมัยใหม่ก้าวทันเทคโนยี สำนักงานบัญชี24 ชม. <br />
              ลูกค้าสามารถเข้าถึงข้อมูลได้ทุกอุปกรณ์ all Device
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default About;

import Image from "next/image";
import React from "react";

const Header = () => {
  return (
    <div className=" bg-[#E0F4FF] min-h-[700px] flex justify-center rounded-b-3xl">
      <div className="w-[80%] py-14 flex">
        <div className="w-[50%]">
          <h1 className=" text-5xl mb-4 text-[#DA0C81]">
            Mtax
            <span className=" text-[#687EFF]">
              Online Accounting: Payroll Outsourcing
            </span>
          </h1>

          <p className=" text-xl mb-10">
            Mtax เราเป็นหนึ่งบริษัทผู้ให้บริการงานบันทึกบัญชีออนไลน์ (Online
            Accounting) , <br></br>งานด้านบัญชีภาษี (Tax Accounting) ,
            งานด้านบัญชีการเงิน (Financial Accounting) งานด้านบัญชีบริหาร
            (Management Accounting) , งานด้านเงินเดือนพนักงาน (Payroll
            Outsourcing) , จัดตั้งบริษัท (Business Startup)
            เราให้บริการเสมือนเป็นส่วนหนึ่งของทีมกิจการท่าน
            เราพร้อมก้าวเดินและเติบโตไปพร้อมกัน
            เราจะเป็นฟันเฟืองตัวหนึ่งของกิจการ
            เราจะรักษาผลประโยชน์ของกิจการท่านเป็นสิ่งที่เราคำนึงถึงเป็นอันดับแรก
            เรามีทีมงานที่มีคุณภาพและพัฒนาอย่างต่อเนื่องเพื่อพร้อมให้คำปรึกษาและดูแลงานที่
            รับผิดชอบอย่างเต็มประสิทธิภาพ
          </p>
          <div className="flex justify-center w-[90%] ">
            <a href="https://flowaccount.com" target="_blank">
              <Image
                className="w-16 h-auto rounded-full mx-3"
                src="/images/partner2.jpg" 
                width={500}
                height={500}
                alt="Picture of the author"/>
            </a>
            <a href="https://www.myaccount-cloud.com" target="_blank">
            <Image
                className="w-16 h-auto rounded-full mx-3"
                src="/images/partner1.jpg" 
                width={500}
                height={500}
                alt="Picture of the author"/>
            </a>
            <a href="https://peakaccount.com/main.html" target="_blank">
            <Image
                className="w-16 h-auto rounded-full mx-3"
                src="/images/partner0.jpg" 
                width={500}
                height={500}
                alt="Picture of the author"/>
            </a>
            <a href="https://www.tfac.or.th/" target="_blank">
            <Image
                className="w-16 h-auto rounded-full mx-3"
                src="/images/partner4.jpg" 
                width={500}
                height={500}
                alt="Picture of the author"/>
            </a>
            <a href="https://www.tfac.or.th/" target="_blank">
            <Image
                className="w-16 h-auto rounded-full mx-3"
                src="/images/partner3.JPG" 
                width={500}
                height={500}
                alt="Picture of the author"/>
            </a>
            
          </div>

        </div>
        <div className="flex items-center justify-center mx-auto">
            <Image
                className="rounded-full object-cover"
                src="/images/about1.png" // Ensure this path is correct
                alt="Picture of the author"
                width={500} // Set your desired width
                height={150} // Set your desired height
                layout="intrinsic" // Use intrinsic to maintain aspect ratio
            />
        </div>
      </div>
    </div>
  );
};

export default Header;

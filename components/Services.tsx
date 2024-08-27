import React from 'react';
import Link from "next/link";

const Services = () => {
  return (
    <section id="service" className='container px-5 py-8 mx-auto'>
      <h3 className='flex justify-center opacity-40 mb-4'>Service</h3>
      <div className="flex flex-wrap -m-12">
        <div className="p-12 md:w-1/2 flex flex-col items-start">
          <h2 className="sm:text-3xl text-2xl title-font font-medium text-gray-900 mt-4 mb-4">Online Accounting บัญชีออนไลน์</h2>
          <p className="leading-relaxed mb-8">ลักษณะการให้บริการ : <br />
            - Cloud Accounting ในการบันทึกบัญชีผ่าน Software มาตรฐาน <br />
            - การส่งเอกสารทางการค้าผ่านสื่ออิเล็กทรอนิกส์ เช่น Email, Line, SMS, Fax, Scan, รูปถ่าย <br />
            - สามารถดูรายการค้าผ่านมือถือ (All Device) <br />
            - ภายใน 24 ชม. หลังส่งเอกสาร สามารถเรียกดูและออกงบการเงินได้ และสามารถ drill down เอกสาร 
          </p>
          <div className="flex items-center flex-wrap pb-4 mb-4 border-b-2 border-gray-100 mt-auto w-full">
            <Link href="/service_sub/online" className="text-indigo-500 inline-flex items-center">รายละเอียดเพิ่มเติม
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
        <div className="p-12 md:w-1/2 flex flex-col items-start">
          <h2 className="sm:text-3xl text-2xl title-font font-medium text-gray-900 mt-4 mb-4">Payroll Outsourcing บัญชีเงินเดือน</h2>
          <p className="leading-relaxed mb-8">  ลักษณะการให้บริการ : <br />
            - รับทำบัญชีเงินเดือนภายนอก สามารถแบ่งงวดการจ่ายเงินเดือนได้ 4 งวด <br />
            - ให้บริการผ่านอินเทอร์เน็ต การยื่นแบบ ภงด.1,การยื่นแบบประกันสังคม, การแจ้งเข้าแจ้งออกพนักงาน <br />
            - การเตรียมไฟล์สำหรับส่งให้ธนาคาร <br />
            - การยื่นแบบ ภงด.90,91 พร้อมใบคำนวณภาษีสำหรับพนักงาน</p>
          <div className="flex items-center flex-wrap pb-4 mb-4 border-b-2 border-gray-100 mt-auto w-full">
            <Link href="/service_sub/payroll" className="text-indigo-500 inline-flex items-center">รายละเอียดเพิ่มเติม
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>  
        </div>
        <div className="p-12 md:w-1/2 flex flex-col items-start">
          <h2 className="sm:text-3xl text-2xl title-font font-medium text-gray-900 mt-4 mb-4">Bookkeeping Services สำนักงานบัญชี</h2>
          <p className="leading-relaxed mb-8"> ลักษณะการให้บริการ : <br />
            - Tax Accounting รับทำบัญชีในรูปแบบสำนักงานบัญชีครอบคลุมงานด้านภาษี ประกันสังคม กรมพัฒนาธุรกิจการค้า ดูแลการยื่นแบบที่เกี่ยวข้องทางราชการ ส่งงบการเงินประจำปี <br />
            - Financial Accounting รับทำบัญชีปิดบัญชีรายเดือน เน้นความถูกต้องตามมาตรฐานบัญชี กระทบยอดเงินฝากธนาคาร ให้ความสำคัญกับกระแสเงินสดของกิจการเป็นสำคัญ <br />
            - Management Accounting รับทำบัญชีบริหาร เป็นงานต่อเนื่องจาก Financial Accounting โดยนำเสนอข้อมูลให้ผู้บริหารในรูปแบบ Dashboard,Infographic,PowerPoint</p>
          <div className="flex items-center flex-wrap pb-4 mb-4 border-b-2 border-gray-100 mt-auto w-full">
            <Link href="\pdf\book.pdf" target="_blank" className="text-indigo-500 inline-flex items-center">รายละเอียดเพิ่มเติม
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
        <div className="p-12 md:w-1/2 flex flex-col items-start">
          <h2 className="sm:text-3xl text-2xl title-font font-medium text-gray-900 mt-4 mb-4">Business Startup รับจัดตั้งธุรกิจ</h2>
          <p className="leading-relaxed mb-8"> ลักษณะการให้บริการ : <br />
            - รับจัดตั้งบริษัทและนิติบุคคล <br />
            - เตรียมแบบฟอร์มสำหรับใช้งานธุรกิจ <br />
            - แนะนำแผนธุรกิจเบื้องต้นสำหรับผู้ประกอบการใหม่ <br />
            - ให้คำปรึกษาด้านกฎหมายการค้าที่สำคัญกับกิจการ <br />
            - รับเปลี่ยนแปลงนิติบุคคลเดิม การเพิ่มทุน การเปลี่ยนอำนาจกรรมการ การเปลี่ยนชื่อบริษัท การเปลี่ยนวัตถุประสงค์ของกิจการ การจดทะเบียนภาษีมูลค่าเพิ่ม</p>
          <div className="flex items-center flex-wrap pb-4 mb-4 border-b-2 border-gray-100 mt-auto w-full">
            <Link href="/service_sub/business" className="text-indigo-500 inline-flex items-center">รายละเอียดเพิ่มเติม
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;
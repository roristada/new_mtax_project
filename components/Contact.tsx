import React from 'react';

const Contact = () => {
  return (
    <section id="contact" className="container mx-auto px-5 py-4">
      <h3 className='flex justify-center opacity-40 -mb-10'>Contact</h3>
      <div className="container px-5 py-24 mx-auto flex sm:flex-nowrap flex-wrap">
        <div className="lg:w-2/3 md:w-1/2 bg-black rounded-lg overflow-hidden sm:mr-10 p-1 flex items-end justify-start relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d968.3377925557148!2d100.50540979582155!3d13.877938388486172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e284cec3735f5f%3A0x9dcb655313b5540f!2z4Lia4Lij4Li04Lip4Lix4LiXIOC5gOC4reC5h-C4oeC5geC4l-C5h-C4geC4i-C5jCDguJrguLHguI3guIrguLXguK3guK3guJnguYTguKXguJnguYwg4LiI4Liz4LiB4Lix4LiU!5e0!3m2!1sth!2sth!4v1709710698609!5m2!1sth!2sth"
            width="100%"
            height="100%"
            loading="lazy"
          ></iframe>
          </div>
        <div className="lg:w-1/3 md:w-1/2 bg-white flex flex-col md:ml-auto w-full md:py-8 mt-8 md:mt-0">
          <h2 className="text-gray-900 text-lg mb-1 title-font font-semibold underline">
            ที่อยู่
          </h2>
          <p className="leading-relaxed mb-3 text-gray-600">
            Mtax Online Accounting Co.,Ltd. <br/>
            บริษัท เอ็มแท็กซ์ บัญชีออนไลน์ จำกัด <br/>
            92 ซอยนนทบุรี 46 ถนนสนามบินน้ำ ต.ท่าทราย อ.เมือง จ.นนทบุรี 11000
          </p>
          <h2 className="text-gray-900 text-lg mb-0 title-font font-semibold underline">
            Contact
          </h2>
          <p className="leading-relaxed mb-1 text-gray-600">
            ช่องทางการติดต่อของเรา
          </p>
          <div className="relative mb-1">
            <h2 className="text-gray-900 text-lg mb-0 title-font font-semibold underline">Email</h2>
            <p><a href="mailto:patinya@mtax.co.th" className="text-indigo-500 leading-relaxed">patinya@mtax.co.th</a></p>
            <p><a href="mailto:patinya@mtax.co.th" className="text-indigo-500 leading-relaxed">mtax@outlook.co.th</a></p>
            <h1 className="text-gray-900 text-lg mb-0 title-font font-semibold underline">Tel.</h1>
            <p className="">02-950-0525<br></br>089-113-8565</p>
            <h1 className="text-gray-900 text-lg mb-0 title-font font-semibold underline">Fax.</h1>
            <p className="">02-950-0470</p>
            <h1 className="text-gray-900 text-lg mb-0 title-font font-semibold">LineID:@Mtax</h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
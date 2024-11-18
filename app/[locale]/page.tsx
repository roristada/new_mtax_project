"use client";
import React from "react";
import Header from "../../components/Header";
import About from "../../components/About";
import Services from "../../components/Services";
import Navbar from "../../components/Navbar";

import Contact from "../../components/Contact";
import Footer from "../../components/Footer";
import { useTranslations } from "next-intl";


const Home = () => {
  
  return (
    <main className=" w-full mx-auto">
      <Navbar />
      <Header />
      <About />
      <Services/>
      <Contact/>
      <Footer/>
    </main>
  );
};

export default Home;

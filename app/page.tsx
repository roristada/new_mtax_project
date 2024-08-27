"use client";
import React from "react";
import Header from "../components/Header";
import About from "../components/About";
import Services from "../components/Services";
import Navbar from "../components/Navbar";



import { useEffect, useState } from "react";
//import jwt_decode from "jwt-decode";
import { useRouter } from "next/navigation";
//import Cookies from "js-cookie";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

interface User {
  id: number;
  email: string;
  role: string;
  exp: string;
}

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

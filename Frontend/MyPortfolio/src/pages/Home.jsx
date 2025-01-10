import React from "react";
import Header from "../components/Header/Header";
import Hero_Section from "../components/Section/Hero_Section";
import Feature_Section from "../components/Section/Features_Section";
import Testimonial_section from "../components/Section/Testimonials_Section";
import Footer from "../components/Footer/Footer";

const HomePage = () => {
   return (
      <div>
          <Header />
          <Hero_Section />
          <Feature_Section />
          <Testimonial_section />
          <Footer />
      </div>
   );
};

export default HomePage;

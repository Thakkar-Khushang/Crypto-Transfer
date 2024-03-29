import React from "react";

import logo from "../../images/images/logo.png";

const Footer = () => (
  <div className="w-full flex md:justify-center justify-between items-center flex-col p-4 gradient-bg-footer">

    <div className="flex flex-[0.5] justify-center items-center">
      <img src={logo} alt="logo" className="w-32" />
    </div>
    <div className="sm:w-[90%] w-full h-[0.25px] bg-gray-400 mt-5 " />

  </div>
);

export default Footer;
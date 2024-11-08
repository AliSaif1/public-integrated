import React, { useState, useEffect } from 'react';
import './index.css'; // If you want to keep the external CSS

const CustomLoader = () => {
  return (
    <>
     <div className="loader-container flex mt-10  justify-center bg-white">
      <span className="loader"></span>
    </div>
    </>
   
    
  );
};

export default  CustomLoader;

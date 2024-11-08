import React from 'react';

const ProfileMedia = ({ PostImageSrc, Instruction, Type, Time, Bio, onClick }) => {
  const Color = ['OrangeColor', 'GreenColor', 'LightPurishColor', 'BlueColor'];

  return (
    <div 
      className="text-[10px] lg:text-[12px] w-[250px] h-[270px] mdm:w-[250px] mdm:h-[270px] bg-white rounded-2xl flex flex-col OverViewBox1 justify-self-center cursor-pointer" 
      onClick={onClick} // Attach the onClick event handler
    >
      <div className="w-[250px] rounded-xl overflow-hidden">
        <div className="h-[200px] rounded-lg flex items-center">
          <img className="aspect-square ProfileMedia" src={PostImageSrc} alt="" />
        </div>
      </div>
      <div className="ml-2 mt-2 text-[9px] xs:text-[10px] sm:text-[13px] md:text-[11px] flex flex-col justify-around">
        <div className={`${Color[Type]} poppins-bold`}><p>{Instruction}</p></div>
        <p className="poppins-bold">{Time}</p>
        <p className="text-black/50 poppins-semibold pb-2">{Bio}</p>
      </div>
    </div>
  );
};

export default ProfileMedia;
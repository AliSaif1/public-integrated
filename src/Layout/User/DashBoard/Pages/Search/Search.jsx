

import { useContext, useLayoutEffect, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import InfluencerProfile from './InfluencerProfile';
const Search = () => {



  const [IsFilterOpen, setIsFilterOpen] = useState(0)
  const [ShowInfluencerProfile, setShowInfluencerProfile] = useState(0)




  return (
    <>

      {/* Side bar Filter  .That will open when IsFilterOpen is Clicked */}



      {ShowInfluencerProfile ? <InfluencerProfile setShowInfluencerProfile={setShowInfluencerProfile} /> :

        <>

          <AnimatePresence>
            {IsFilterOpen && (
              <div className="bg-neutral-300/65 z-20 h-full w-full absolute top-0 right-0 ">
                <motion.div
                  initial={{ x: 700 }}
                  animate={{ x: 0 }}
                  exit={{ x: 700 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white h-full  w-[300px] sm:w-[600px] absolute top-0 right-0  "
                >
                  <div className="mx-8 my-5  ">
                    <div className="hover:cursor-pointer" onClick={() => setIsFilterOpen(false)}>
                      <img src="Svg/Close.svg" alt="" />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>


          {/* Container or margin from side */}
          <div className="pt-10 ">
            {/* <ScreenSizeDisplay/> */}

            <p className="lato-bold md:text-xl  text-center ">
              Search from the Worlds <span style={{ color: "#FB773F" }} className="defaultTextColor">Largest Database </span>of Influencer
            </p>

            {/* options Influencer size age  */}

            <div className="flex justify-center mt-10 ">
              <div className="flex">

                <div className="   md:w-[100px] md:h-[35px] absolute rounded-2xl xs:flex justify-center items-center hidden xs:block">
                  <p className="rouge-script-regular p-1  text-2xl z-20">Instagram
                  </p>
                </div>

                {/* Search bar  */}

                <div
                  type="text"
                  className=" w-[250px]  flex justify-center  relative xs:w-[350px]  sm:w-[400px] pl-2 xs:pl-[90px] rounded-xl   md:h-[35px] md:w-[500px] md:pl-[110px] outline-0  text-[9px] xs:text-[10px] sm:text-[13px] md:text-sm  bg-white overflow-hidden "
                  placeholder="Search  anything here ... "
                >
                  <div className="absolute top-3 right-5 cursor-pointer  h-full ">
                    <img src="Svg/SearchIcon.svg" alt="" />
                  </div>
                  <input type="text" className="w-full outline-0"
                    placeholder="Search  anything here ... " />

                </div>


                {/* Filter button . Upon click the side menu of IsFilerState will open  */}
                <div className=" border-[2px] border-primary md:w-[100px] md:h-[35px] rounded-2xl flex justify-center items-center ml-1 xs:ml-5 md:ml-5 hover:cursor-pointer hover:bg-primary hover:text-white hover:border-white " onClick={() => {
                  setIsFilterOpen(1)
                }} >
                  <div className="lato-light p-2   flex justify-between ">
                    <p className="hidden xs:block text-[10px] sm:text-[13px] md:text-sm">More   </p>
                    <p className="ml-1 text-[10px] sm:text-[13px] md:text-sm ">Filters</p>
                  </div>
                </div>

              </div>

            </div>


            {/* If you want to add filters than you can do it herer */}

            <AddedFilters />


            {/* influencer Profile will be show below in form of list  */}



            <ProfileInformation ProfileImage="Media/p1.jpg" name="Sana Sabir" UserName="@sanasabir321" Followers="92.3K" ER="34%" Instagram="4.5K" Likes="12.2K" Comments="23K" Bio="Embrace the Ashin Aura 
Where Tradition Meets Trend" pic1="Media/p1.jpg" pic2="Media/p6.jpg" pic3="Media/p7.jpg" pic4="Media/p9.jpg" setShowInfluencerProfile={setShowInfluencerProfile} />

            <ProfileInformation ProfileImage="Media/p7.jpg" name="Sana Sabir" UserName="@sanasabir321" Followers="92.3K" ER="34%" Instagram="4.5K" Likes="12.2K" Comments="23K" Bio="Embrace the Ashin Aura 
Where Tradition Meets Trend" pic1="Media/p1.jpg" pic2="Media/p6.jpg" pic3="Media/p7.jpg" pic4="Media/p9.jpg" setShowInfluencerProfile={setShowInfluencerProfile} />


          </div>
        </>}






    </>
  )
}



const ProfileInformation = ({ ProfileImage, name, UserName, Followers, ER, Instagram, Likes, Comments, Bio, pic1, pic2, pic3, pic4, setShowInfluencerProfile }) => {

  return (

    <>
      <div className="mb-10">
        {/* wrapper div orr background of list  */}
        <div className="bg-white OverViewBox2 xs:grid grid-cols-12 w-[300px] xs:w-[500px] sm:w-[640px] md:w-[740px] lg:w-[800px] p-2 border-2 mx-auto mt-5 rounded-xl">

          {/* Left side of profile  */}
          <div className="flex flex-col  col-span-3 items-center mt-3">
            <div className="flex size-[60px] xs:size-[80px] sm:size-[100px] md:size-[100px] items-center">
              <img className=" aspect-square Avatar" src={`${ProfileImage}`} alt="" />
            </div>
            {/* Name of Influencer  */}
            <p className="poppins-bold text-[9px] xs:text-[10px] sm:text-[13px] md:text-sm mt-4" >{name}</p>
            {/* Id of Influencer  */}
            <p className="lato-regular text-[9px] xs:text-[10px] sm:text-[13px] md:text-sm text-black/50 ">{UserName}</p>
            {/* Influencer Actions  */}

            {/* End of left side  */}
          </div>

          {/* Middle of profile  */}
          <div className=" col-span-8 sm:col-span-6 ml-5 xs:ml-10 sm:ml-0 flex flex-col xs:border-l-2 sm:border-l-0 lg:border-l-2 ">
            <div className="     sm:mt-10 mr-4  ">
              <div className="flex items-center justify-around sm:mr-1 md:mr-2">


                <div className="lato-regular">
                  <div><span className="poppins-bold text-[9px] xs:text-[10px] sm:text-[13px] md:text-sm">{Followers}</span><span className="ml-1 md:text-sm sm:text-[13px]  text-[9px] xs:text-[10px] ">Followers</span></div>
                  <div className="flex items-center  sm:mt-1 md:mt-2">
                    {/* bottom side  */}
                    <img className="h-[12px] xs:h-[15px] sm:h-[20px] mr-2" src="Svg/Instagram.svg" alt="" />
                    <p className="lato-light text-[9px]  xs:text-[10px] sm:text-base">{Instagram}</p>
                  </div>
                </div>
                <div className="lato-regular " >
                  <div><span className="poppins-bold  text-[9px] sm:text-[13px] md:text-sm xs:text-[10px] ">{ER}</span><span className="ml-1 md:text-sm sm:text-[13px]  xs:text-[10px] text-[9px]">Engagement Rate</span></div>
                  <div className=" flex justify-center gap-x-3 mt-2">
                    <div className=" flex items-center gap-x-1 ">
                      <img src="/Svg/Heart.svg" className="Avatar  size-[12px] xs:size-[15px] sm:h-[16px]" alt="" />
                      <p className="text-[9px] lato-light  xs:text-[10px] sm:text-sm"> {Likes}</p>
                    </div>
                    <div className="flex items-center  gap-x-1">
                      <img src="/Svg/Comment.svg" className="Avatar size-[12px] xs:size-[15px] sm:h-[16px]" alt="" />
                      <p className="text-[9px] lato-light  xs:text-[10px] sm:text-sm">  {Comments}</p>
                    </div>



                  </div>

                </div>

              </div>
              {/* Bio Heading in Middle section  */}
              <div className="poppins-regular text-[9px]  sm:text-[13px] md:text-sm mt-5  xs:text-[10px] text-center ml-2">
                <p>{Bio}</p>
              </div>
              <div className=" xs:flex  mt-4 gap-x-2 justify-center">
                <p className='SilverButtonWithText text-[9px] sm:text-[12px] lg:text-sm xs:text-[10px]  cursor-pointer' onClick={() => {
                  setShowInfluencerProfile(1)
                }} >View Report</p>
                <div className="OrangeButtonWithText mt-2 xs:mt-0  text-[9px] flex items-center sm:text-[12px] lg:text-sm xs:text-[10px] cursor-pointer"><p>Add to my network</p></div>
              </div>
            </div>
          </div>


          {/* Right of profile  */}
          <div className=" hidden sm:block col-span-3  place-content-center">

            {/* making the grid of 4 pictures of influencer */}


            <div className="grid grid-cols-2 grid-rows-2  rounded-xl overflow-hidden ">
              <div className="flex items-center ">
                <img className="aspect-square Avatar-v1" src={`${pic1}`} alt="" />
              </div>
              <div className="flex items-center ">
                <img className="aspect-square Avatar-v1" src={`${pic2}`} alt="" />
              </div>
              <div className="flex items-center ">
                <img className="aspect-square Avatar-v1" src={`${pic3}`} alt="" />
              </div>
              <div className="flex items-center ">
                <img className="aspect-square Avatar-v1" src={`${pic4}`} alt="" />
              </div>


            </div>
            {/* End of the Grid of influncer pictures */}
          </div>

          {/* End Wrapper div */}
        </div>
        {/* end of influencer List */}
      </div>

    </>
  )

}





const AddedFilters = () => {
  // Initial state with items
  const [items, setItems] = useState([
    "Budget: 900$",
    "Age: 21"
  ]);

  // Function to remove an item by index
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="flex  justify-center mt-5 gap-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="filters   text-[9px] sm:text-sm xs:text-[10px] flex justify-between"
        >
          <p>{item}</p>
          <button
            onClick={() => removeItem(index)}
            className=" text-red-500 ml-3 ">
            &times;
          </button>

        </div>
      ))}
    </div>
  );
};


export default Search
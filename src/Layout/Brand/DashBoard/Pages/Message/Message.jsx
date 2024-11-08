import { useContext, useLayoutEffect, useEffect } from 'react'
import  '../../../../../index.css';
import { useState } from 'react';
const Message = () => {


  const [ShowMessage, setShowMessage] = useState(0)

 
  return (
    <>

      {/* Background Color */}
      <div className="bg-white  h-screen text-[9px] xs:text-[10px] sm:text-[13px] md:text-[14px] ">

        {/* Wrapper */}
        <div className={`${ShowMessage ? 'block sm:grid sm:grid-cols-12 mdm:w-[800px] lg:w-[1000px] mx-auto' : 'sm:grid sm:grid-cols-12 mdm:w-[800px] lg:w-[1000px] mx-auto'}`}>




          {/* Left Side */}

          <div className={`${ShowMessage?'hidden sm:block sm:col-span-4 border-r-[1px] pr-2 h-screen ml-2':'col-span-4 border-r-[1px] pr-2 h-screen ml-2'}`}>

            {/* Top Search */}

            <div className="flex  justify-center mt-5 sm:mt-5 sm:justify-between items-center     ">
              <div className="  ">
                <div className="flex items-center  w-[250px]  sm:w-[180px]     mdm:w-[200px] lg:w-[250px]  relative">
                  <img className="size-[20px]  absolute top-3 left-2" src="/Svg/SearchIcon.svg" alt="" />
                  <input className="outline-0  bg-none w-full  h-[40px]   bg-black/5 rounded-lg pl-9" type="text" placeholder="Search" />
                </div>
              </div>
              <div className="OrangeButtonWithText-v3 fixed bottom-10 right-10 sm:bottom-0 sm:right-0 sm:relative  sm:size-[30px] mdm:size-[40px]    flex items-center  cursor-pointer justify-center"><p className=" text-2xl">+</p></div>

            </div>

            {/* Influencer list  */}
            <div className="ml-10 mr-2 mt-5">
              <p className="poppins-semibold text-[15px]">Member</p>
              <InfluncerMessage Image={"p1.jpg"} Name="Rizwan" Time="12:00 AM" Message="hi" Unread="2"

               
                setShowMessage={setShowMessage}
              />
              <InfluncerMessage Image={"p6.jpg"} Name="Sana" Time="1:00 PM" Message="Now I am here" Unread={0}  />
              <InfluncerMessage Image={"p7.jpg"} Name="Ali" Time="06:00 PMz" Message="OK! its done" Unread="5" />

            </div>

          </div>




          {/* Right Side */}
          <div className={`${ShowMessage ? 'w-full block sm:col-span-8' : 'hidden sm:block  col-span-8'}`}>

            {/* Wrrapper */}
            <div className="mx-2 relative">

              {/* Top Header Name of Reciver  */}
             
              <div className=' flex   text-[9px] sm:text-[10px] mdm:text-[12px]'>
            
              <div className={`${ShowMessage?'flex mr-4 sm:hidden':'hidden'}`}
              onClick={() => {
                setShowMessage(0)
              }}
              >
                <img src="/Svg/Back.svg" alt="" />
              </div>
                <img className='size-[40px] Avatar' src={`/Media/p1.jpg`} alt="" />
                <div className=' flex flex-1 flex-col  ml-2'>
                 
                  <div className='flex flex-1 justify-between  items-center'>
                    <p className='poppins-semibold '> Rizwan Sabir</p>
                  </div>
                  <div className='flex  ml-1   text-black/70 text-[10px]  items-center gap-1'>
                    <div className="size-[6px] rounded-full bg-green-500"></div>
                    <p>online</p>
                  </div>

                </div>
              </div>
              <Test ShowMessage={ShowMessage} />


            </div>

          </div>





        </div>


      </div>


    </>
  )
}


const InfluncerMessage = ({ Image, Name, Time, Message, Unread,setShowMessage }) => {

  return <>
    <div className=' flex  my-4 text-[9px] sm:text-[10px] mdm:text-[12px]'  onClick={() => {
                  console.log("it is clicked");
                  setShowMessage(1);}}>

      <img className='size-[35px] Avatar' src={`/Media/${Image}`} alt="" />
      <div className=' flex flex-1 flex-col  ml-2'>
        <div className='flex flex-1 justify-between  items-center'>
          <p className='poppins-semibold '> {Name}</p>
          <p className=' poppins-medium  text-[10px]'>{Time}</p>
        </div>
        <div className='flex justify-between  text-black/70 text-[10px] '>
          <p>{Message}</p>
          {Unread ? <p className='bg-primary/90 px-2 text-white  flex items-center rounded-full  '>{Unread}</p> : ""}
        </div>
      </div>
    </div>


  </>

}






const messages = [
  { id: 1, text: "omg, this is amazing", sender: "them" },
  { id: 2, text: "perfect! ✅", sender: "them" },
  { id: 3, text: "Wow, this is really epic", sender: "them" },
  { id: 4, text: "How are you?", sender: "me" },
  { id: 5, text: "just ideas for next time", sender: "them" },
  { id: 6, text: "I'll be there in 2 mins ⏳", sender: "them" },
  { id: 7, text: "woohoooo", sender: "me" },
  { id: 8, text: "Haha oh man", sender: "me" },
  { id: 9, text: "Haha that's terrifying 🧟", sender: "me" },
  { id: 10, text: "aww", sender: "them" },
  { id: 11, text: "omg, this is amazing", sender: "them" },
  { id: 12, text: "woohoooo 🔥", sender: "them" },
];

function Test({ ShowMessage }) {
  return (
    <div className={`${ShowMessage ? 'xs:flex items-center   bg-gray-100    w-full' : 'hidden  xs:flex items-center   bg-gray-100    w-full'} `}>
      <div className="  w-full bg-white rounded-lg shadow-lg p-4  ">

        <div className="space-y-4 overflow-y-auto  mdm:h-[280px] lg:h-[400px]   scrol1">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${message.sender === 'me' ? 'bg-orange-500 text-white' : 'bg-gray-200'
                  }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4  flex gap-2">
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Type a message..."
          />
          <img src="/Svg/Send.svg" alt="" />
        </div>
      </div>
    </div>
  );
}




export default Message
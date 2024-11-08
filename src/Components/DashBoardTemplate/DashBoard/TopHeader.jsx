import { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const TopHeader = ({ SideBar, setSideBar, Pages, activeButton }) => {
  // Removing the / from the Pages to display the Correct Name
  const PageName = Pages.map(path => path.substring(1));

  // If sidebar is open, change the color
  const HandBurger = `h-1 rounded-full w-[30px] my-1 ${SideBar ? 'bg-white' : 'bg-black'}`;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // Use navigate for redirection
  const [user, setUser] = useState(null); // State to store user data

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/user/getProfileData', { // Use your provided API endpoint
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUser(data); // Store the user data in state
      } catch (error) {
        console.error(error); // Handle error as needed
      }
    };

    fetchUserData(); // Call the function to fetch user data
  }, []); // Empty dependency array to run only once on mount

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Clear the cookie
    Cookies.remove('yourCookieName'); // Replace with your actual cookie name
    // Redirect to login
    window.location.href = '/Login';
    // Close the dropdown menu
    setIsDropdownOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    // Add event listener when the component mounts
    document.addEventListener('mousedown', handleClickOutside);
    // Remove event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(false); // Close the dropdown
    navigate('/profile', { state: { user } }); // Pass user data in state
  };

  return (
    <div className='w-full h-[60px] bg-white flex items-center'> {/* Dashboard Top Heading */}
      <div className='poppins-semibold mx-10 flex justify-between w-full rounded-full items-center'>
        <div className='flex items-center'>
          <MotionConfig transition={{ duration: 0.5 }}>
            <div
              className={`md:hidden mr-4 z-20 ${SideBar ? 'text-black' : 'text-white'}`}
              onClick={() => setSideBar(!SideBar)}
            >
              {/* Hamburger Three lines and their animation */}
              <motion.div
                style={{ transformOrigin: "left center" }}
                animate={SideBar ? { rotate: 45, transformOrigin: "left center", x: "-2px" } : ""}
                className={HandBurger}
              />
              <motion.div
                animate={SideBar ? { x: -100, opacity: 0 } : { x: 0, opacity: 1 }}
                className={HandBurger}
              />
              <motion.div
                style={{ transformOrigin: "right center" }}
                animate={SideBar ? { rotate: -45, transformOrigin: "right center", x: "-11px", y: -17 } : ''}
                className={HandBurger}
              />
            </div>
          </MotionConfig>
          {/* Header Name is displayed here */}
          <p>{PageName[activeButton]}</p>
        </div>
        {/* Profile picture and Notification Icon are displayed here */}
        <div className='relative'>
          <div className='flex justify-between w-[100px]' onClick={toggleDropdown}>
            <img src="/Svg/Notification.svg" alt="Notification" />
            <img className='w-[45px] h-[45px] Avatar rounded-full' src={user?.photo} alt="Avatar" />
          </div>
          {/* Dropdown for profile options */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              id="dropdownDivider"
              className="z-10 absolute right-0 bg-white divide-y divide-orange-100 rounded-lg shadow w-44 text-black dark:divide-orange-600 border-2 border-[#FB773F] text-[12px] mt-2"
            >
              <ul className="py-2 text-black" aria-labelledby="dropdownDividerButton">
                <li>
                  <a href="#" className="block px-4 py-2 hover:bg-orange-100" onClick={handleProfileClick}>
                    Profile
                  </a>
                </li>
                <li>
                  <a href="#" className="block px-4 py-2 hover:bg-orange-100">Settings</a>
                </li>
              </ul>
              <div className="py-2">
                <a
                  className="block px-4 py-2 hover:bg-orange-100"
                  onClick={handleLogout}
                >
                  Logout
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopHeader;
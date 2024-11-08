import {useNavigate} from 'react-router-dom';
import {useState} from 'react'; 
import {motion} from 'framer-motion';

const NavBarItems = ({ items,path }) => {
    const [isHover, setIsHover] = useState(-1);
    const [isActive, setIsActive] = useState(0);
    const navigate = useNavigate();
  
    return (
      <>
        {items.map((item, index) => (
          <div
            key={index}
            className="poppins-semibold relative px-1 z-50 w-full sm:px-2 text-center sm:py-2 cursor-pointer text-sm"
            onMouseEnter={() => setIsHover(index)}
            onMouseLeave={() => setIsHover(-1)}
            onClick={() => {
              setIsActive(index);
              navigate(`/${path}/${item}`);
            }}
          >
            <li className={`${isActive === index || isHover === index ? 'text-primary' : ''} `}>
              <p>{item}</p>
              {isActive === index && (
                <motion.div layoutId="1" className="absolute w-full bg-white h-full top-0 left-0 p-2 rounded-full -z-10"></motion.div>
              )}
            </li>
          </div>
        ))}
      </>
    );
  };

  export default NavBarItems;
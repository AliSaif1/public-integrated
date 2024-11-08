import { useMemo } from 'react'



import BrandDashBoardTemplate from '../../Components/DashBoardTemplate/DashBoardBoardTemplate';
import HomeIcon from '../../Components/Svg/HomeIcon';
import CompaignIcon from '../../Components/Svg/CompaignIcon';
import MainBar from './MainBar';


const BrandDashBoard = () => {


  // We used the Usememo Hook  to store these objects as they are being passed to Component and i donot
  // want to render the component because the  object reference changes on each render
  let DashBoardData = useMemo(() => {

    
    // Used to display the Icon and Its name on Hover and when Click address
    //image ,name hover,link 
    let IconNames = [['HomeIcon', 'Dashboard', '/Dashboard'], ['Queries', 'Queries', 'Queries'],['Payment', 'Payment', 'Payment']]

    // It will navigate the page upon the user itself add URL orr by navigate funtion when user Click 
    // It will the Active Button according to 0,1,2,3,4,5,6
    let Pages = ['/Dashboard', '/Queries',]


    let menuItems = [
      { icon: <HomeIcon color="white" />, label: 'Dashboard', navigate: "/Dashboard" },
      { icon: <CompaignIcon color="white" />, label: 'Queries', navigate: "/Queries" },
      { icon: <CompaignIcon color="white" />, label: 'Payment', navigate: "/Payment" },
    ];

    return {  IconNames, Pages, menuItems }
  }, [])



  return (
    <>
      <BrandDashBoardTemplate IconNames={DashBoardData.IconNames} Pages={DashBoardData.Pages} menuItems={DashBoardData.menuItems} >
        {/* // we pass the main bar as the children that contains the /Home /Search Routes and pages  */}
        <MainBar />

      </BrandDashBoardTemplate>

    </>
  )
}

export default BrandDashBoard
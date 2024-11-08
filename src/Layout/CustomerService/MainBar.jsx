import { Routes, Route } from 'react-router-dom';
import Home from './DashBoard/Pages/Home/Home';
import OverView from './DashBoard/Pages/Home/OverView';
import ErrorPage from './DashBoard/Pages/ErrorPage/ErrorPage';
import Queries from './DashBoard/Pages/Queries/Queries';
import Contract from './DashBoard/Pages/Queries/Contract';
import Payment from './DashBoard/Pages/Payment/Payment';

const MainBar = () => {
  return (
    <div className='w-full bg-gray-200/90 h-full'>
      <Routes>
        <Route path="/*" element={<Home />}>
          <Route path='Dashboard/*' element={<OverView />} />
          <Route path='OverView' element={<OverView />} />
         


        </Route>
        <Route path='Queries'  >
        <Route index element={<Queries />} />
        <Route path='Contract' element={<Contract />} />
        
        </Route>


        <Route path='Payment'  >
        <Route index element={<Payment />} />
        
        </Route>


        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
  );
};



export default MainBar;
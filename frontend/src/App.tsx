import {BrowserRouter,Routes,Route} from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Admin from './pages/Admin';
import {About,Services,Team,Gallery,Offers,Contact,Login,Account} from './pages/Pages';
import './styles.css';

export default function App(){
  return <BrowserRouter><Routes>
    <Route path="/admin" element={<Admin/>}/>
    <Route element={<Layout/>}>
      <Route path="/" element={<Home/>}/>
      <Route path="/about" element={<About/>}/>
      <Route path="/services" element={<Services/>}/>
      <Route path="/team" element={<Team/>}/>
      <Route path="/gallery" element={<Gallery/>}/>
      <Route path="/offers" element={<Offers/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/account" element={<Account/>}/>
      <Route path="/book" element={<Booking/>}/>
      <Route path="/payment/callback" element={<Booking/>}/>
      <Route path="*" element={<Home/>}/>
    </Route>
  </Routes></BrowserRouter>
}

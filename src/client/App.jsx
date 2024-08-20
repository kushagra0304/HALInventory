import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import "./App.css";
import Category from './pages/Category';
import MyNav from './components/MyNav';
import Item from './pages/Item';
// import Loan from './pages/loan';

function App() {
  return (
    <Router>
      <div className="App container">
        <Routes>
          <Route path="/" element={<MyNav/>}>
            <Route path="/category" element={<Category/>} />
            <Route path="/item" element={<Item/>} />
            {/* <Route path="/loan" element={<Loan/>}/> */}
          </Route>
          <Route path="/*" />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

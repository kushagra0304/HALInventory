import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import "./App.css";

function App() {

  return (
    <Router>
      <div className="App">
      <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/category" component={About} />
          <Route path="/item" component={Contact} />
          <Route path="/item-variation" component={Contact} />
          <Route path="/loan" component={Contact} />
          <Route path="*" component={NotFound} />
        </Switch>
      </div>
    </Router>

  );
}

export default App;

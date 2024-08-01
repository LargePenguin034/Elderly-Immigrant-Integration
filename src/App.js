import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import './App.css';

const App = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={Home} />
      {/* Add other routes here */}
    </Switch>
  </Router>
);

export default App;

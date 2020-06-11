import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';

const routes = () => {
  return (
    <BrowserRouter>
      <Route component={Home} path="/" exact={true}></Route>
      <Route component={CreatePoint} path="/create-point"></Route>
    </BrowserRouter>
  ); 
};

export default routes;
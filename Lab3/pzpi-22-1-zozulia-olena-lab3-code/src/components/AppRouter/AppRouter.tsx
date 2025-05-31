import { observer } from "mobx-react-lite";
import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { applicationRoutes } from "../../routes";
import { Navbar } from "../Navbar/Navbar";

export const AppRouter = observer(() => {

  return (
    <div>
      <Navbar>
        <Routes>
          {applicationRoutes.map(({path, Component}) => 
            <Route path={path} key={path} element={<Component />} />
          )}
        </Routes>
      </Navbar>
    </div>
  );
});

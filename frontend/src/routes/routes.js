import React from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../Layouts/Header/Header";
import Footer from "../Layouts/Footer/Footer";
import HomePage from "../Pages/HomePage/HomePage";
import AdminPanel from "../Pages/AdminPanel/AdminPanel";
import ManageAdmin from "../Pages/AdminPanel/ManageAdmin/ManageAdmin";
import AllPolls from "../Pages/AllPolls/AllPolls";
import PollDetail from "../Pages/PollDetail/PollDetail";
import ProposalForm from "../Pages/ProposalForm/ProposalForm";
import NoMatch from "../Pages/NoMatch/NoMatch";
import NPayConverter from "../Pages/Npay/NpayConverter";

const Root = () => {
  return (
    <>
      <ToastContainer />

      <Outlet />
    </>
  );
};

const BPCContainter = (props) => {
  const Comp = props.component;
  return (
    <>
      <Header />
      <Comp />
      <Footer />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <NoMatch />,
    children: [
      {
        path: "/",
        element: <BPCContainter component={HomePage} />,
      },
      {
        path: "/poll-detail/:proposalId",
        element: <BPCContainter component={PollDetail} />,
      },
      {
        path: "/all-polls",
        element: <BPCContainter component={AllPolls} />,
      },
      {
        path: "/admin",
        element: <BPCContainter component={AdminPanel} />,
      },
      {
        path: "/proposal-form",
        element: <BPCContainter component={ProposalForm} />,
      },
      {
        path: "/manage-admin",
        element: <BPCContainter component={ManageAdmin} />,
      },
      {
        path: "/npay",
        element: <NPayConverter />,
      },
    ],
  },
]);

export default router;

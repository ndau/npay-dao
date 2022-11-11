import React from 'react';
import { createBrowserRouter , Outlet} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '../Layouts/Header/Header';
import Footer from '../Layouts/Footer/Footer';
import HomePage from '../Pages/HomePage/HomePage';
import AdminPanel from '../Pages/AdminPanel/AdminPanel';
import ManageAdmin from '../Pages/AdminPanel/ManageAdmin/ManageAdmin';
import AllPolls from '../Pages/AllPolls/AllPolls';
import PollDetail from '../Pages/PollDetail/PollDetail';
import ProposalForm from '../Pages/ProposalForm/ProposalForm';
import NoMatch from '../Pages/NoMatch/NoMatch';

const Root = () => {
  return (
    <>
      <ToastContainer />
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NoMatch />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/poll-detail/:proposalId',
        element: <PollDetail />,
      },
      {
        path: '/all-polls',
        element: <AllPolls />,
      },
      {
        path: '/admin',
        element: <AdminPanel />,
      },
      {
        path: '/proposal-form',
        element: <ProposalForm />,
      },
      {
        path: '/manage-admin',
        element: <ManageAdmin />,
      },
    ],
  },
]);

export default router;

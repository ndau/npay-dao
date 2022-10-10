import { Routes, Route } from "react-router-dom";
import HomePage from "../Pages/HomePage/HomePage";
import AdminPanel from "../Pages/AdminPanel/AdminPanel";
import ManageAdmin from "../Pages/AdminPanel/ManageAdmin/ManageAdmin";
import AllPolls from "../Pages/AllPolls/AllPolls";
import PollDetail from "../Pages/PollDetail/PollDetail";
import ProposalForm from "../Pages/ProposalForm/ProposalForm";
import NoMatch from "../Pages/NoMatch/NoMatch";
import useNdauConnectStore from "../store/ndauConnect_store";

const AllRoutes = () => {
  const isAdmin = useNdauConnectStore((state) => state.isAdmin);
  let isSuperAdmin = useNdauConnectStore((state) => state.isSuperAdmin);

  // isSuperAdmin = 1;

  console.log(isSuperAdmin, "isSuperAdmin");

  // const isAdmin = 1;
  // console.log(isAdmin,"isAdmin")

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/poll-detail/:proposalId" element={<PollDetail />} />
      <Route path="/all-polls" element={<AllPolls />} />
      {(isSuperAdmin || isAdmin) && (
        <Route path="/admin" element={<AdminPanel />} />
       )} 
      <Route path="/proposal-form" element={<ProposalForm />} />
      {isSuperAdmin && 
      <Route path="/manage-admin" element={<ManageAdmin />} />
      }
      <Route path="*" element={<NoMatch />} />
    </Routes>
  );
};
export default AllRoutes;

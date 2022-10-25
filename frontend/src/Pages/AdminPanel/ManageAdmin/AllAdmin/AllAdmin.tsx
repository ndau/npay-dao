import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosRequest } from "../../../../api/api";
import ReactPaginate from "react-paginate";
import AllAdminTable from "./AdminTable/AllAdminTable";
import Placeholder from "react-bootstrap/Placeholder";
import useAdminPanelRefreshStore from "../../../../store/adminPanelRefresh_store";

const adminUrl = "admin";
const itemsPerPage = 5;

interface apiProps {
  triggerUseEffectCounterState: any;
}

const AllAdmin = (props: apiProps) => {
  const [allAdminInfoState, setAllAdminInfoState] = useState<any>([]);
  const [totalState, setTotalState] = useState(20);
  const [itemOffset, setItemOffset] = useState(0);
  const setRefreshAllAdminStateFunc = useAdminPanelRefreshStore(
    (state) => state.setRefreshAllAdminStateFunc
  );

  async function refreshAllAdminState(_offset?: number) {
    try {
      const response = await axiosRequest("get", adminUrl, undefined, {
        limit: itemsPerPage,
        offset: _offset,
      });

      setAllAdminInfoState(response.data.admins);
      setTotalState(response.data.total);
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
      console.error(error);
    }
  }

  const handlePageClick = (event: any) => {
    const newOffset = event.selected * itemsPerPage;
    setItemOffset(newOffset);
  };

  useEffect(() => {
    setRefreshAllAdminStateFunc(refreshAllAdminState);
  }, [refreshAllAdminState]);

  useEffect(() => {
    const getAllAdminAsyncFunc = async () => {
      await refreshAllAdminState(itemOffset);
    };
    getAllAdminAsyncFunc();
  }, [itemOffset, props.triggerUseEffectCounterState]);

  return (
    <>
      {allAdminInfoState.length ? (
        <>
          {" "}
          <AllAdminTable
            allAdminData={allAdminInfoState}
            CallAllAdminApi={refreshAllAdminState}
          />
          {totalState && (
            <ReactPaginate
              breakLabel="..."
              nextLabel="Next"
              onPageChange={handlePageClick}
              pageRangeDisplayed={1}
              marginPagesDisplayed={1}
              pageCount={totalState / itemsPerPage}
              breakClassName="breaklable"
              previousLabel="Previous"
              previousClassName="prevPagination"
              nextClassName="nextPagination"
              containerClassName="containerPagination"
              pageClassName="pagePagination"
              activeClassName="activePagePagination"
            />
          )}{" "}
        </>
      ) : (
        <Placeholder sx={12} className="vh-100" />
      )}
    </>
  );
};
export default AllAdmin;

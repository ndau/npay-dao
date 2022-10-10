import { useState, useEffect } from "react";
import { axiosRequest } from "../../../api/api";
import UnapprovedProposalsTable from "../Tables/UnapprovedProposalsTable";
import ReactPaginate from "react-paginate";
import Placeholder from "react-bootstrap/Placeholder";
import useAdminPanelRefreshStore from "../../../store/adminPanelRefresh_store";

const itemsPerPage = 5;
let total: number;

interface UnapprovedProps {
  sortingOrder: string;
  searchQuery: string;
}

const UnapprovedProposalsList = (props: UnapprovedProps) => {
  const setRefreshUnapprovedProposalListFunc = useAdminPanelRefreshStore(
    (state) => state.setRefreshUnapprovedProposalListFunc
  );
  const [currentUnapprovedProposalsState, setCurrentUnapprovedProposalsState] =
    useState<any[]>([]);
  const [itemOffset, setItemOffset] = useState(0);

  async function getUnapprovedProposals(offset?: number) {
  try {
      const response = await axiosRequest(
        "get",
        "proposal/unapproved",
        undefined,
        {
          limit: itemsPerPage,
          offset,
          order: props.sortingOrder,
          search_term: props.searchQuery,
        }
      );
      if (response.data.proposals.length === 0) {
        setCurrentUnapprovedProposalsState([]);
      } else {
        setCurrentUnapprovedProposalsState(response.data.proposals);
      }

      total = response.data.total;
    } catch (error) {
      console.error(error);
    }
  }
  
  useEffect(() => {
    setRefreshUnapprovedProposalListFunc(getUnapprovedProposals);
  }, [getUnapprovedProposals]);

  useEffect(() => {
    const getUnapproveProposalAsyncFunc = async () => {
      await getUnapprovedProposals(itemOffset);
    };
    getUnapproveProposalAsyncFunc();
  }, [itemOffset, props.sortingOrder, props.searchQuery]);

  // Invoke when user click to request another page.
  const handlePageClick = (event: any) => {
    const newOffset = event.selected * itemsPerPage;
    setItemOffset(newOffset);
  };
  //refresh admin panel in response to proposal approve/reject emit to update unapproved getUnapprovedProposals emit
  return (
    <div>
      {currentUnapprovedProposalsState.length > 0 ? (
        <>
          <UnapprovedProposalsTable
            currentUnapprovedProposalsArr={currentUnapprovedProposalsState}
          />
          <ReactPaginate
            breakLabel="..."
            nextLabel="Next"
            onPageChange={handlePageClick}
            pageRangeDisplayed={1}
            marginPagesDisplayed={1}
            pageCount={total / itemsPerPage}
            breakClassName="breaklable"
            previousLabel="Previous"
            previousClassName="prevPagination"
            nextClassName="nextPagination"
            containerClassName="containerPagination"
            pageClassName="pagePagination"
            activeClassName="activePagePagination"
          />
        </>
      ) : (
        <>
          <div>
            <h4
              style={{
                textAlign: "center",
                color: "white",
                marginTop: "100px",
              }}
            >
              Data not Found
            </h4>
          </div>
        </>
      )}
    </div>
  );
};
export default UnapprovedProposalsList;

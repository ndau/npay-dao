import { useState, useEffect } from "react";
import { axiosRequest } from "../../../api/api";
import TableAppproved from "../Tables/ProcessedProposalTable";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";

const itemsPerPage = 5;

interface ProcessedProposalListPropsI {
  processedProposalEndpoint: "proposal/rejected" | "proposal/approved";
  sortingOrder: string;
  searchQuery: string;
}

const ProcessedProposalsList = (props: ProcessedProposalListPropsI) => {
  const [proposalsListState, setProposalsListState] = useState<any[]>([]);
  const [totalState, setTotalState] = useState();
  const [itemOffset, setItemOffset] = useState(0);

  async function getApprovedProposals(offset: number) {
    try {
      const response = await axiosRequest(
        "get",
        props.processedProposalEndpoint,
        undefined,
        {
          limit: itemsPerPage,
          offset,
          order: props.sortingOrder,
          search_term: props.searchQuery,
        }
      );

      if (response.data.proposals.length === 0) {
        setProposalsListState([]);
      } else {
        setProposalsListState(response.data.proposals);
      }

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
    const getApprovedProposalsAsyncFunc = async () => {
      await getApprovedProposals(itemOffset);
    };
    getApprovedProposalsAsyncFunc();
  }, [itemOffset, props.sortingOrder, props.searchQuery]);

  return (
    <>
      {proposalsListState.length > 0 ? (
        <>
          <TableAppproved apiData={proposalsListState} />
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
          )}
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
    </>
  );
};
export default ProcessedProposalsList;

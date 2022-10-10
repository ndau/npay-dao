import VotingOptions from "./VotingOption/VotingOption";

interface RowsPropsi {
  id: number;
  heading: string | null;
}

const Rows = (props: RowsPropsi) => {
  return (
    <>
      <tr>
        <td>
          <div className="d-flex justify-content-center  ">{props.id}</div>
        </td>
        <td>{props.heading}</td>
      </tr>
    </>
  );
};

export default Rows;

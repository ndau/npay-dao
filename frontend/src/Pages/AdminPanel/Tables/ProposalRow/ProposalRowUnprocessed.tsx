import VotingOptions from "./VotingOption/VotingOption";

interface RowsPropsi {
  id: number;
  heading: string | null;
  summary: string | null;
  voting_options: any;
  votingPeriod: string;
}

const Rows = (props: RowsPropsi) => {
  return (
    <>
      <tr>
        <td>
          <div className="d-flex justify-content-center  ">{props.id}</div>
        </td>
        <td>{props.heading}</td>
        <td>{props.summary}</td>
        <td className="d-flex justify-content-start">
          <VotingOptions voting_options={props.voting_options} />
        </td>
        <td>
          <div className="d-flex justify-content-center  ">
            {props.votingPeriod}
          </div>
        </td>
      </tr>
    </>
  );
};

export default Rows;

interface votingOptionsI {
  voting_options: any;
}

const VotingOptions = (props: votingOptionsI) => {
  let votingOptionsArray;
  //checking if the props are from Unapproved api or approve/rejected api
  if (Array.isArray(props.voting_options)) {
    votingOptionsArray = props.voting_options;
  } else {
    votingOptionsArray = Object.values(props.voting_options);
  }

  return (
    <div>
      {votingOptionsArray.map((item, index) => (
        <div className="mb-1">{`${index + 1} . ${item}`}</div>
      ))}
    </div>
  );
};

export default VotingOptions;

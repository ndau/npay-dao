import VoteOptionStyles from "./VoteOptionStyles.module.css";

interface VoteOptionProps {
  voteOptionSummary: string;
  selected?: boolean;
  smMarginTop?: boolean;
}

const VoteOption = ({
  voteOptionSummary,
  selected,
  smMarginTop,
}: VoteOptionProps) => {
  let voteOptionContainerClassName = `${VoteOptionStyles.voteOptionContainer}`;

  if (smMarginTop)
    voteOptionContainerClassName =
      `${voteOptionContainerClassName} ${VoteOptionStyles.smMarginTop}`;

  if (selected) {
    voteOptionContainerClassName =
      `${voteOptionContainerClassName} ${VoteOptionStyles.selected}`;
  }
  return (
    <div className={voteOptionContainerClassName}>{voteOptionSummary}</div>
  );
};

export default VoteOption;

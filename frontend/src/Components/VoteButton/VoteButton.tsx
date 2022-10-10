import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { socketBase } from "../../types/socketTypes";
import useNdauConnectStore from "../../store/ndauConnect_store";

type VoteButtonPropsI = {
  dynamicClassName?: string;
  selectedVoteOptionId: number | undefined;
};

async function submitVote<T extends socketBase>(
  _socket: T | null,
  _selectedVoteOptionId: number | undefined,
  _walletAddress: string
) {
  if (_socket) {
    if (_selectedVoteOptionId) {
      _socket.emit("website-create_vote-request-server", {
        websiteSocketId: _socket.id,
        selectedVoteOptionId: _selectedVoteOptionId,
        walletAddress: _walletAddress
      });

      try {
        toast.info("Awaiting Vote Confirmation");
      } catch {
        toast.error("Something went wrong. Couldn't vote");
      }
    }
  } else {
    toast.warning("Wallet Not Connected");
  }
}
const VoteButton = ({
  dynamicClassName,
  selectedVoteOptionId,
}: VoteButtonPropsI) => {
  const walletAddress = useNdauConnectStore((state) => state.walletAddress);
  const socket = useNdauConnectStore((state) => state.socket);

  return (
    <Button
      onClick={() => submitVote(socket, selectedVoteOptionId, walletAddress)}
      className={dynamicClassName}
      variant="success"
    >
      Add Vote
    </Button>
  );
};

export default VoteButton;

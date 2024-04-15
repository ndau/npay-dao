import { useEffect, useState } from "react"
import { Button, Spinner } from "react-bootstrap"
import useNdauConnectStore from "../../store/ndauConnect_store";
import { axiosRequest, baseURL } from "../../api/api";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import useMetamask from "../../contexts/metamask/use_metamask";

const ndauConnectApi = baseURL.slice(0, -4);
let socket;

export const socketEmit = (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

const ConnectMetamaskButton = () => {
    const [isMetamasConnecting, setIsMetamasConnecting] = useState(false);
    const { connectMetamask, metamaskWeb3 } = useMetamask();
    const updateWalletAddress = useNdauConnectStore( (state) => state.updateWalletAddress );
    
    const setSocket = useNdauConnectStore((state) => state.setSocket);
    const getAdmin = useNdauConnectStore((state) => state.getIsAdmin);
    const getSuperAdmin = useNdauConnectStore((state) => state.getIsSuperAdmin);
    const updateTransactions = useNdauConnectStore( (state) => state.updateTransactions);

    const connectMetamaskHandler = async () => {
       await connectMetamask(setIsMetamasConnecting); 
    }

    useEffect(() => {
        if(metamaskWeb3.walletAddress){    
          updateWalletAddress(metamaskWeb3.walletAddress);
        }
    }, [metamaskWeb3.walletAddress]);

    return(
        <Button
            onClick={connectMetamaskHandler}
            variant="contained"
            sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
           
            "&:hover": {
                color: "#E6E6E6",
                backgroundColor: "#957EDB",
            },
            }}
        >
            {
                isMetamasConnecting ? (
                    <Spinner variant="white" animation="border" size="sm" />
                ) : (
                    <img src="/assets/images/mm.svg" alt="My SVG" style={{ width: '30px', height: '25px' }} />
                )
            }
      </Button>
    )
}

export default ConnectMetamaskButton;
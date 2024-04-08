import { useEffect, useState } from "react"
import { Button, Spinner } from "react-bootstrap"
import useNdauConnectStore from "../../store/ndauConnect_store";
import useWalletConnect from "../../contexts/wallet_connect/use_wallet_connect";

const ConnectWalletConnectButton = () => {
    const [isWalletConnectConnecting, setIsWalletConnectConnecting] = useState(false);
    const { walletConnectConnectHandler, walletConnectWeb3 } = useWalletConnect();
    const updateWalletAddress = useNdauConnectStore( (state) => state.updateWalletAddress );
    const updateProvider = useNdauConnectStore( (state) => state.updateProvider );
    
    const connectWalletConnectHandler = async () => {
        updateProvider('walletConnect');
       await walletConnectConnectHandler(setIsWalletConnectConnecting); 

       if(walletConnectWeb3.walletAddress) updateWalletAddress(walletConnectWeb3.walletAddress);
    } 

    return(
        <Button
            onClick={connectWalletConnectHandler}
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
                isWalletConnectConnecting ? (
                    <Spinner variant="white" animation="border" size="sm" />
                ) : (
                    <img src="/assets/images/wc.png" alt="My SVG" style={{ width: '30px', height: '25px' }} />
                )
            }
      </Button>
    )
}

export default ConnectWalletConnectButton;
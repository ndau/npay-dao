import { useEffect, useState } from "react"
import { Button, Spinner } from "react-bootstrap"
import useNdauConnectStore from "../../store/ndauConnect_store";
import useMetamask from "../../contexts/metamask/use_metamask";

const ConnectMetamaskButton = () => {
    const [isMetamasConnecting, setIsMetamasConnecting] = useState(false);
    const { connectMetamask, metamaskWeb3 } = useMetamask();
    const updateWalletAddress = useNdauConnectStore( (state) => state.updateWalletAddress );
    const updateProvider = useNdauConnectStore( (state) => state.updateProvider );

    const connectMetamaskHandler = async () => {
        updateProvider('metamask');
        const walletAddress = await connectMetamask(setIsMetamasConnecting); 
        
        if(walletAddress) updateWalletAddress(walletAddress);
    }


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
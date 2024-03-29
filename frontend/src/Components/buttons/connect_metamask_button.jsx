import { useEffect, useState } from "react"
import { Button, Spinner } from "react-bootstrap"
import useMetamask from "../../utils/hooks/use_metamask";
import useNdauConnectStore from "../../store/ndauConnect_store";
import { axiosRequest, baseURL } from "../../api/api";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

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
           
            socketEmit("ndau_burn_wallet_connect", {
                website_socket_id: socket.id,
                app_socket_id: "31231",
                action: "burn",
                wallet_address:metamaskWeb3.walletAddress,
            });

            socket.on(
                "server-ndau_connection-established-website",
                async ({ walletAddress: _walletAddress }) => {
                  updateWalletAddress(metamaskWeb3.walletAddress);
                  getAdmin();
                  getSuperAdmin();
        
                  const resp = await axiosRequest(
                    "get",
                    "admin/ndau_conversion",
                    {},
                    {
                      ndau_address: _walletAddress,
                    }
                  );
                  if (resp.data.status === true) {
                    updateTransactions(resp.data.result);
                  }
                }
            );
        }
    }, [metamaskWeb3.walletAddress]);

    useEffect(() => {
        socket = io(ndauConnectApi);
    
        if (socket) {
          //even though socket is initialized here, it is not accessible via the global store until socket connection with wallet is established
          socket.on("ndau_burn_reject", ({}) => {
            toast.error("Conversion Failed.", { position: "top-left" });
          });
    
          socket.on(
            "ndau_burn_approve",
            async ({ walletAddress: _walletAddress }) => {
              toast.success("Conversion Success.", { position: "top-left" });
    
              console.log("received wallet connect event");
              updateWalletAddress(_walletAddress);
              getAdmin();
              getSuperAdmin();
    
              const resp = await axiosRequest(
                "get",
                "admin/ndau_conversion",
                {},
                {
                  ndau_address: _walletAddress,
                }
              );
              if (resp.data.status === true) {
                updateTransactions(resp.data.result);
              }
            }
          );
              
          setSocket(socket);
        }
      }, []);

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
import { useEffect, useState } from 'react';
import walletConnectContext from './context';
import { Web3Modal } from '@web3modal/standalone';
import { SignClient } from '@walletconnect/sign-client';
import { toast } from 'react-toastify';

const WalletConnectContextProvider = ({ children }) => {

    const [walletConnectWeb3, setWalletConnectWeb3] = useState({
        walletAddress: '',
        session: null,
        signClient: null
    })

    const web3Modal = new Web3Modal({
        projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
        standaloneChains: ["eip155:5"]
    })

    async function createClient(){
        try{
          const signClient = await SignClient.init({
            projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID
          })
          setWalletConnectWeb3(prev => ({
            ...prev,
            signClient
          }));
          await subscribeToEvents(signClient);
        } catch(e) {
          console.error("Error creating clietn", e);
        }
    }

    async function onSessionConnected(sessionNamespace, walletAddress){
        try {
            setWalletConnectWeb3(prev => ({
                ...prev,
                session: sessionNamespace,
                walletAddress
            }));
        } catch(e){
          console.error(e)
        }
    }

    async function walletConnectConnectHandler(setIsWalletConnectConnecting){
        try {
          
          if (!walletConnectWeb3.signClient) throw Error("SignClient does not exist");

          setIsWalletConnectConnecting(true);

          const proposalNamespace = {
            eip155: {
              methods: [
                  'eth_sendTransaction',
                  'eth_signTransaction',
                  'eth_sign',
                  'personal_sign',
                  'eth_signTypedData',
                  'eth_signTypedData_v4'
                ],
                chains: ["eip155:5"],
                events: ["connect", "disconnect"]
              }
          }
          
          const { signClient } = walletConnectWeb3;
          const { uri, approval  } = await signClient.connect({
            requiredNamespaces: proposalNamespace
          });
          
          let walletAddress = '';
          if (uri){
            web3Modal.openModal({ uri });
            const sessionNamespace = await approval();
            walletAddress = sessionNamespace.namespaces.eip155.accounts[0].slice(9);
            onSessionConnected(sessionNamespace, walletAddress);
            web3Modal.closeModal();
          } 

          setIsWalletConnectConnecting(false);
          return walletAddress;
        } catch(e){
            let msg =  "Something went wrong!";
            if(e.code === 5002){
                web3Modal.closeModal();
                msg = "Permission request rejected";
            }
            toast.error(msg);
            setIsWalletConnectConnecting(false);
        }
    }

    async function handleWalletConnectDisconnectHandler() {
        try {
            const { signClient, session } = walletConnectWeb3;

            await signClient.disconnect({
                topic: session.topic,
                message: "User disconnected",
                code: 6000,
            });
            reset();
        } catch (e) {
          console.error("Error disconnecting", e);
        }
    }
    
    const reset = () => {
        walletConnectWeb3({
            walletAddress: '',
            session: null,
            signClient: null
        });
    };

    async function subscribeToEvents(client) {
        if (!client)
          throw Error("Unable to subscribe to events. Client does not exist.");
        try {
          client.on("session_delete", () => {
            console.log("The user has disconnected the session from their wallet.");
            reset();
          });
        } catch (e) {
          console.log("Error subscribing events", e);
        }
    }

    const handleWalletConnectSignin = async (selectedVoteOption) => {
        try {
            const { signClient, walletAddress } = walletConnectWeb3;

            if (!signClient) throw Error("SignClient does not exist");
            
            const domain = {
                name: 'Oneiro',
                version: '1',
                chainId: 1,
                //verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
            };

            const types = {    
                "Voting:": [
                    {
                        name: 'Proposal ID',
                        type: 'string'
                    },
                    {
                        name: "Proposal Heading",
                        type: 'string'
                    },
                    {
                        name: "Voting Option ID",
                        type: 'string'
                    },
                    {
                        name: "Voting Option Heading",
                        type: 'string'
                    }
                ]
            };

            const value =  {
                "Proposal ID": selectedVoteOption?.proposal_id,
                "Proposal Heading": selectedVoteOption?.proposal_heading,
                "Voting Option ID": selectedVoteOption?.voting_option_id,
                "Voting Option Heading": selectedVoteOption?.voting_option_heading
            };
            
            // Define the typed data according to the EIP-712 schema
            const msgParams =  {
                types,
                primaryType: 'Voting:',
                domain,
                message: value
            }

            const method = "eth_signTypedData_v4";
            const params = [walletAddress, JSON.stringify(msgParams)];

            const { session } = walletConnectWeb3;
            const signature = await signClient.request({
                topic: session.topic,
                chainId: 'eip155:1',
                request: {
                method,
                params
                }
            })
            
            return{
                signature,
                message: msgParams
            }

            } catch (error) {
                toast.error(error?.message || "Something went wrong!");
                console.error('Error signing in:', error);
            }
    };


    useEffect(() => {
        if(!walletConnectWeb3.signClient){
          createClient();
        }
    }, [walletConnectWeb3.signClient])

    return(
        <walletConnectContext.Provider value={{ walletConnectWeb3, handleWalletConnectDisconnectHandler, walletConnectConnectHandler, handleWalletConnectSignin }}>
            { children }
        </walletConnectContext.Provider>
    );
}

export default WalletConnectContextProvider;
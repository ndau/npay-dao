import { useState } from 'react';
import detectEthereumProvider from "@metamask/detect-provider";
import metamaskContext from './context.ts';
import { toast } from 'react-toastify';

const MetamaskContextProvider = ({ children }) => {
    const [metamaskWeb3, setMetamaskWeb3] = useState({
        provider: null,
        walletAddress: null
    })

    const connectMetamask = async(setIsConnectingMetamask) => {
        try{
            setIsConnectingMetamask(true);
            const provider = await detectEthereumProvider(); // provider = window.ethereum
           
            if(!provider) {
                //Metamastk is not detected i.e. extension is uninstalled or corrupted
                setIsConnectingMetamask(false);
                toast.error("Please install Metamask!"); 
                return false;
            }

            const walletAddress = await provider.request({ method: 'eth_requestAccounts' });
            setMetamaskWeb3({ provider, walletAddress: walletAddress.pop().toLowerCase() })
            setIsConnectingMetamask(false);

            return true;
        }catch(err){
            setIsConnectingMetamask(false);
            toast.error(err?.message || "Something went wrong!");
            return false;
        }
    }

    const signInUser = async (selectedVoteOption) => {
        try {

            if(!metamaskWeb3.provider){
                toast.error("Wallet not connected");
                return false;
            }

            const domain = {
                name: 'Oneiro',
                version: '1',
                chainId: 1,
                verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
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
            const signature = await metamaskWeb3.provider.request({
                "method": "eth_signTypedData_v4",
                params: [metamaskWeb3.walletAddress, msgParams]
            });

           return {
            signature,
            message: msgParams
           };
        } catch (err) {
            toast.error(err?.message || "Something went wrong!");
            return false;
        }
    }

    return(
        <metamaskContext.Provider value={{ signInUser, connectMetamask, metamaskWeb3 }}>
            { children }
        </metamaskContext.Provider>
    )
}

export default MetamaskContextProvider;
import detectEthereumProvider from "@metamask/detect-provider";
import { useState } from "react";
import { toast } from "react-toastify";

const useMetamask = () => {

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

    const signInUser = async () => {
        try {
            const host = window.location.hostname;
            const uri = window.location.href;
            const nonce = Date.now();
            const dateTime = new Date().toISOString();
            const chainId = parseInt(window.ethereum.chainId);
            const walletAddress = metamaskWeb3.walletAddress;

            const welcomeMessage = `${host} wants you to sign in with your account: ${walletAddress} \n\nWelcome to Oneiro. Signing is the only way we can truly know that you are the owner of the wallet you are connecting. Signing is a safe, gas-less transaction that does not in any way give permission to perform any transactions with your wallet. \n\nURI: ${uri} \nVersion: 1 \nChain ID: ${chainId} \nNonce: ${nonce} \nIssued At: ${dateTime}`;

            const signature = await metamaskWeb3.provider.request({
                "method": "personal_sign",
                params: [welcomeMessage, walletAddress]
            });

           return signature;
        } catch (err) {
            toast.error(err?.message || "Something went wrong!");
            return false;
        }
    }
    

    return {
        connectMetamask,
        metamaskWeb3,
        signInUser
    }
}

export default useMetamask;
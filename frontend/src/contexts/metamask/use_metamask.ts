import { useContext } from "react";
import metamaskContext from "./context";

interface MetamaskWeb3 {
    provider: any;
    walletAddress: string;
}

interface MetamaskContextType {
    signInUser: () => boolean | string;
    connectMetamask: any;
    metamaskWeb3: MetamaskWeb3;
}

const useMetamask =  () => {
    const context = useContext(metamaskContext) as MetamaskContextType;

    if (!context) {
        throw new Error('useMetamask must be used within a MetamaskProvider');
    }

    return context;
}

export default useMetamask;
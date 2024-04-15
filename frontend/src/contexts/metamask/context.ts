import { createContext } from "react";

interface MetamaskWeb3 {
    provider: any;
    walletAddress: string;
}

interface MetamaskContextType {
    signInUser: () => boolean | string;
    connectMetamask: any;
    metamaskWeb3: MetamaskWeb3;
}

const metamaskContext = createContext<MetamaskContextType>({
    signInUser: () => false,
    connectMetamask: undefined,
    metamaskWeb3: {
        provider: undefined,
        walletAddress: '' // Example initial value for walletAddress, explicitly typed as string
    }
});

export default metamaskContext;
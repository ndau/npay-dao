import { useContext } from "react"
import walletConnectContext from "./context"

const useWalletConnect = () => {
    const context = useContext(walletConnectContext);
    if(!context) throw Error("useWalletConnect must be used withing WalletConnectContextProvider");

    return context;
}

export default useWalletConnect;
import { socketBase } from "../types/socketTypes";

import { axiosRequest } from "../api/api";

import create from "zustand";

interface ndauConnectStateI {
  walletAddress: string;
  updateWalletAddress: (_walletAddress: string) => void;

  provider: string;
  updateProvider: (_provider: string) => void;

  socket: socketBase | null;
  setSocket: (_socket: any) => void;

  votes: any; // { [proposal_id]: status }
  resetVotes: () => void;
  setVoted: (_voted: boolean, proposal_id: string) => void;

  isAdmin: boolean;
  getIsAdmin: () => void;

  isSuperAdmin: boolean;
  getIsSuperAdmin: () => void;

  transactions: any;
  updateTransactions: (_transactions: any) => void;
}

const useNdauConnectStore = create<ndauConnectStateI>((set, get) => ({
  walletAddress: "",
  updateWalletAddress: (_walletAddress: string) =>
    set(() => ({ walletAddress: _walletAddress })),

  provider: "",
  updateProvider: (_provider: string) =>
    set(() => ({ provider: _provider })),

  transactions: [],
  updateTransactions: (_transactions: any) =>
    set(() => ({ transactions: _transactions })),

  votes: {},
  resetVotes: () => set(() => ({ votes: {} })),
  setVoted: (_voted: boolean, proposal_id: string) =>
    set((prevState: ndauConnectStateI) => ({
      votes: { ...prevState.votes, [proposal_id]: _voted },
    })),

  socket: null,
  setSocket: <T extends socketBase>(_socket: T) =>
    set(() => ({ socket: _socket })),

  isAdmin: false,
  getIsAdmin: () => {
    async function getIsAdmin() {
      let getIsAdminResponse = await axiosRequest(
        "get",
        "admin/is-admin",
        undefined,
        {
          walletAddress: get().walletAddress,
        }
      );
      console.log(getIsAdminResponse, "getIsAdminResponse");
      let _isAdmin = getIsAdminResponse.data.isAdmin;
      set(() => ({ isAdmin: _isAdmin }));
    }
    getIsAdmin();
  },

  isSuperAdmin: false,
  getIsSuperAdmin: () => {
    async function getIsSuperAdmin() {
      let getIsAdminResponse = await axiosRequest(
        "get",
        "superadmin/is-superadmin",
        undefined,
        {
          walletAddress: get().walletAddress,
        }
      );
      let _isSuperAdmin = getIsAdminResponse.data.isSuperAdmin;
      console.log(getIsAdminResponse, "getIsAdminResponse");
      set(() => ({ isSuperAdmin: _isSuperAdmin }));
    }
    getIsSuperAdmin();
  },

  logout: () => {
    set((state) => ({
      ...state,
      isAdmin: false,
      isSuperAdmin: false,
      walletAddress: "", // Clear walletAddress
      socket: null,
      provider: ""
    }));
  },
}));

export default useNdauConnectStore;

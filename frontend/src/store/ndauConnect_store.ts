import { socketBase } from "../types/socketTypes";

import { axiosRequest } from "../api/api";

import create from "zustand";

interface ndauConnectStateI {
  walletAddress: string;
  updateWalletAddress: (_walletAddress: string) => void;

  socket: socketBase | null;
  setSocket: (_socket: any) => void;

  isAdmin: boolean;
  getIsAdmin: () => void;

  isSuperAdmin: boolean;
  getIsSuperAdmin: () => void;
}

const useNdauConnectStore = create<ndauConnectStateI>((set, get) => ({
  walletAddress: "",
  updateWalletAddress: (_walletAddress: string) =>
    set(() => ({ walletAddress: _walletAddress })),

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

  logout: ()=>{
    set(()=>({isAdmin:false,isSuperAdmin:false,walletAddress:"",socket:null}))
    
  }

}));

export default useNdauConnectStore;

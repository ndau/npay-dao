import create from "zustand";

interface adminPanelRefreshStoreI {
  refreshUnapprovedProposalListFunc: (_offset?: number) => void;
  setRefreshUnapprovedProposalListFunc: (
    _newRefreshUnapprovedProposalListFunc: (_offset?: number) => {}
  ) => void;

  refreshAllAdminStateFunc: (_offset?: number) => void;
  setRefreshAllAdminStateFunc: (
    _newRefreshAllAdminStateFunc: (_offset?: number) => {}
  ) => void;

  refreshProposalDetailFunc: () => void;
  setRefreshProposalDetailFunc: (
    _newRefreshProposalDetailFunc: () => {}
  ) => void;
}

const useAdminPanelRefreshStore = create<adminPanelRefreshStoreI>(
  (set, get) => ({
    refreshUnapprovedProposalListFunc: (_offset?: number) => {},
    setRefreshUnapprovedProposalListFunc: (
      _newRefreshUnapprovedProposalListFunc: (_offset?: number) => {}
    ) =>
      set(() => ({
        refreshUnapprovedProposalListFunc:
          _newRefreshUnapprovedProposalListFunc,
      })),

    refreshAllAdminStateFunc: (_offset?: number) => {},
    setRefreshAllAdminStateFunc: (
      _newRefreshAllAdminStateFunc: (_offset?: number) => {}
    ) =>
      set(() => ({ refreshAllAdminStateFunc: _newRefreshAllAdminStateFunc })),

    refreshProposalDetailFunc: () => {},
    setRefreshProposalDetailFunc: (_newRefreshAllAdminStateFunc: () => {}) =>
      set(() => ({ refreshProposalDetailFunc: _newRefreshAllAdminStateFunc })),
  })
);

export default useAdminPanelRefreshStore;

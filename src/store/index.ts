import { createStore } from 'vuex'

export default createStore({
  state: {
    account: '',
    currentAddress: '',
    LSP10Vaults: { account: '', value: [] },
    isVault: false
  },
  getters: {
  },
  mutations: {
    switchAddress (state, address:string) {
      if (address === state.account) {
        state.isVault = false
        return
      }
      if (state.LSP10Vaults.value.indexOf(address as never) !== -1 || address === state.account) {
        state.currentAddress = address
        state.isVault = true
        console.log('switch address:', address)
      } else {
        console.log(`not found ${address} vault`)
      }
    }
  },
  actions: {
    initAddress ({ commit, state }, address:string) {
      state.account = address
      state.currentAddress = address
      state.LSP10Vaults = { account: state.account, value: [] }
      try {
        state.LSP10Vaults = JSON.parse(localStorage.getItem('vaults') as string)
      } catch (e) {
        console.log(e)
      }
    }
  },
  modules: {
  }
})

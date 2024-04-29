'use client'

import {useState,useEffect} from 'react'
import {ethers} from 'ethers'
//Components
import Overview from './components/Overview';
import Holdings from './components/Holdings';
import Values from './components/Values';
import Assets from './components/Assets';

import marketSnapshot from './snapshots/markets.json'
import tokensSnapshot from './snapshots/tokens.json'
import pricesSnapshot from './snapshots/prices.json'

export default function Home() {
  const[account,setAccount] = useState(null)
  const[trackedTokens,setTrackedTokens] = useState([])

  const[markets,setMarkets] = useState(null)
  const[tokens,setTokens] = useState([])

  const getMarkets = async ()=>{
    const ROOT_URL = `https://api.coingecko.com/api/v3`
    const ENDPOINT = `/coins/markets`
    const AMOUNT = 50
    const ARGUMENTS = `?vs_currency=usd&category=ethereum-ecosystem&order=market_cap_desc&per_page=${AMOUNT}&page=1&sparkline=false&locale=en`

    const response = await fetch(ROOT_URL + ENDPOINT + ARGUMENTS)

    setMarkets(await response.json())
  }

  const getToken = async()=>{
    const id = trackedTokens[trackedTokens.length-1]
    //market data
    const market = markets.find((market)=>market.id===id)
    
     //Token details through API request
     const ROOT_URL = `https://api.coingecko.com/api/v3`
     const TOKEN_ENDPOINT = `/coins/${id}`
     const TOKEN_ARGUMENTS = `?tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`

     const tokenResponse = await fetch(ROOT_URL + TOKEN_ENDPOINT + TOKEN_ARGUMENTS)
     const tokenSnapshot = await tokenResponse.json()

     const details = tokenSnapshot.detail_platforms.ethereum

    //fetch token 7 day average prices through AAPI request
     const PRICES_ENDPOINT = `/coins/${id}/market_chart/`
     const PRICES_ARGUMENTS = `?vs_currency=usd&days=7&interval=daily`

     const pricesResponse = await fetch(ROOT_URL + PRICES_ENDPOINT + PRICES_ARGUMENTS)
     const prices = (await pricesResponse.json()).prices
     
    //fetch balances
    const ETH_RPC_URL = `https://rpc.ankr.com/eth`
    const PROVIDER = new ethers.JsonRpcProvider(ETH_RPC_URL)
    const ABI = ["function balanceOf(address) view returns (uint)"]

    let balance
    
    if(details){
      const contract = new ethers.Contract(details.contract_address,ABI,PROVIDER)
      balance = Number(ethers.formatUnits(await contract.balanceOf(account),details.decimal_place))
    }else{
       balance = Number(ethers.formatUnits(await PROVIDER.getBalance(account),18))
    }
    //token object
    const token = {
      id:id,
      market:market,
      address:details?details.contract_address:null,
      prices:prices,
      balance:balance,
      value: market.current_price*balance
    }
    setTokens([...tokens,token])
  }

  useEffect(()=>{
    if(!markets){
      getMarkets()
    }
    if(trackedTokens.length!==0){
      getToken()
    }
  },[trackedTokens])

  return (
    <main >
      <h2>Portfolio Overview</h2>

      <Overview 
      account={account} 
      setAccount={setAccount}
      markets={markets}
      trackedTokens={trackedTokens}
      setTrackedTokens={setTrackedTokens}
      tokens={tokens}
      />

      <div className = "details">
      <div className = "divider"></div>

      <Holdings tokens={tokens}/>

      <Values tokens={tokens}/>

      <Assets tokens={tokens} setTokens = {setTokens}/>

      </div>
    </main>
  )
}

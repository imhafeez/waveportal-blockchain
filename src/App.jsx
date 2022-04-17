import React from "react";
import { ethers } from "ethers";
import {useEffect, useState} from "react"
import abi from "./utils/WavePortal.json"

import './App.css';

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [currentWave, setCurrentWave] = useState(0);
  const [isMining, setIsMining] = useState(false);

  
  const contractAddress = process.env['contract_address']
  /**
   * Create a variable here that references the abi content!
   */
  const contractABI = abi.abi;

  
  const checkIfWalletIsConnected = async () => {

    try {
      const { ethereum } = window;

      if(!ethereum) {
        console.log("Make sure you have connect your wallet");
      }else {
        console.log("We have ethereum object",ethereum);
      }

      const accounts = await ethereum.request({method:"eth_accounts"});
      if(accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);

      const providers = new ethers.providers.Web3Provider(ethereum);
      const signer = providers.getSigner();

      const wavePortalContract = new ethers.Contract(contractAddress,contractABI,signer);
      let count = await wavePortalContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());
      setCurrentWave(count.toNumber());
      }
      
    } catch (error) {
      console.log(error);
    }
    
    
  }

  
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const connectWallet = async ()=> {
    try {
      const {ethereum} = window;

      if(!ethereum) {
        console.log("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"})

      console.log("Connected",accounts[0]);

      setCurrentAccount(accounts[0]);

     
      
    } catch (error) {
      console.log(error);
    }
  }

  const wave = async ()=> {

    try {

      const {ethereum} = window;
      if(ethereum) {
        const providers = new ethers.providers.Web3Provider(ethereum);
        const signer = providers.getSigner();

        const wavePortalContract = new ethers.Contract(contractAddress,contractABI,signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        
        const waveTxn = await wavePortalContract.wave();

        setIsMining(true);
        console.log("Minning...",waveTxn.hash);

        await waveTxn.wait();
        console.log("Minned -- ", waveTxn.hash);

        setIsMining(false);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setCurrentWave(count.toNumber());
        
      }else {
        console.log("Ethereum object doesn't exist!");
      }
      
      

      
    } catch (error) {
      console.log(error);
    }
    
  }

  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Hafeez and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>
        
        
      
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currentAccount && (<button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>)}

        {currentAccount  && !isMining && (<div className="waveCount">I got {currentWave} 👋🏻</div>)}
        {currentAccount && isMining && (<div className="waveCount">⛏ Mining ... </div>)}

      </div>   
    </div>
  );
}

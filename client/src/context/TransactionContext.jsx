import React, { useEffect, useState } from 'react';

import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    // var filter = {
    //     address: contractAddress,
    //     fromBlock: 0
    // };
    // var callPromise = provider.getLogs(filter);
    // callPromise.then(function(events) {
    //     console.log("Printing array of events:");
    //     console.log(events);
    // }).catch(function(err){
    //     console.log(err);
    // });
    const signer = provider.getSigner();
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
    return transactionsContract;
};

export const TransactionProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState('')
    const [formData, setFormData] = useState({
        addressTo: '',
        amount: '',
        keyword: '',
        message: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setFormData((prevState) =>
            ({ ...prevState, [name]: e.target.value })
        )
    }

    const getTransactions = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");

            const transactionContract = getEthereumContract();

            const availableTransactions = await transactionContract.getAllTransactions();

            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }));

            console.log(structuredTransactions)
            setTransactions(structuredTransactions);

        } catch (error) {
            console.log(error);
        }
    };


    const checkIfWalletIsConnected = async () => {

        try {
            if (!ethereum) return alert("Please install metamask");

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                getTransactions();
            } else {
                console.log("No accounts found")
            }

        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }


    }

    const checkIfTransactionsExist = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");

            const transactionContract = getEthereumContract();

            const transactionCount = await transactionContract.getTransactionCount();

            localStorage.setItem("transactionCount", transactionCount)



        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");

            const { addressTo, amount, keyword, message } = formData;

            const parsedAmount = ethers.utils.parseEther(amount);

            const transactionContract = getEthereumContract();

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value: parsedAmount._hex,
                }]
            });



            const transactionHash = await
                transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

            setIsLoading(true);
            console.log(`Loading.... ${transactionHash.hash}`);

            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success.... ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionCount.toNumber());

            window.reload();

        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, [])

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, handleChange, setFormData, sendTransaction, transactions, isLoading }} >
            {children}
        </TransactionContext.Provider>
    )
}

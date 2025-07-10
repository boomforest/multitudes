// MetaMask Integration Component
import React, { useState, useEffect } from 'react';

const MetaMaskWallet = ({ onWalletConnect, currentUser }) => {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        setIsMetaMaskInstalled(true);
        
        // Check if already connected
        if (window.ethereum.selectedAddress) {
          setWalletAddress(window.ethereum.selectedAddress);
          setIsConnected(true);
        }
      } else {
        setIsMetaMaskInstalled(false);
      }
    };

    checkMetaMask();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          if (onWalletConnect) {
            onWalletConnect(accounts[0]);
          }
        } else {
          setWalletAddress('');
          setIsConnected(false);
        }
      });
    }

    return () => {
      // Cleanup listeners
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [onWalletConnect]);

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed!');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        setIsConnected(true);
        
        // Call the callback function to update parent component
        if (onWalletConnect) {
          onWalletConnect(address);
        }
      }
    } catch (err) {
      console.error('Error connecting to MetaMask:', err);
      setError('Failed to connect to MetaMask. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setIsConnected(false);
    if (onWalletConnect) {
      onWalletConnect('');
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // If MetaMask is not installed
  if (!isMetaMaskInstalled) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-orange-600 mr-2">⚠️</div>
          <div>
            <h3 className="font-semibold text-orange-800">MetaMask Required</h3>
            <p className="text-orange-700 text-sm mt-1">
              Please install MetaMask to connect your wallet
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors"
            >
              Install MetaMask
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If wallet is connected
  if (isConnected && walletAddress) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-green-600 mr-2">✅</div>
            <div>
              <h3 className="font-semibold text-green-800">Wallet Connected</h3>
              <p className="text-green-700 text-sm mt-1">
                {formatAddress(walletAddress)}
              </p>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  // Connection interface
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-blue-600 mr-2">🔗</div>
          <div>
            <h3 className="font-semibold text-blue-800">Connect Wallet</h3>
            <p className="text-blue-700 text-sm mt-1">
              Connect your MetaMask wallet to GRAIL
            </p>
          </div>
        </div>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
      </div>
      {error && (
        <div className="mt-3 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default MetaMaskWallet;

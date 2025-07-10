// MetaMaskWallet.jsx - Create this file in your src folder
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
      <div style={{
        background: 'rgba(255, 193, 7, 0.1)',
        border: '2px solid #ffc107',
        borderRadius: '20px',
        padding: '1rem',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#856404', fontSize: '1.1rem' }}>
          MetaMask Required
        </h3>
        <p style={{ margin: '0 0 1rem 0', color: '#856404', fontSize: '0.9rem' }}>
          Install MetaMask to connect your wallet
        </p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: '#ffc107',
            color: '#212529',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '15px',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  // If wallet is connected
  if (isConnected && walletAddress) {
    return (
      <div style={{
        background: 'rgba(40, 167, 69, 0.1)',
        border: '2px solid #28a745',
        borderRadius: '20px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🔗</div>
            <div>
              <h3 style={{ margin: '0', color: '#155724', fontSize: '1rem' }}>
                Wallet Connected
              </h3>
              <p style={{ margin: '0', color: '#155724', fontSize: '0.8rem' }}>
                {formatAddress(walletAddress)}
              </p>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            style={{
              background: 'rgba(220, 53, 69, 0.1)',
              color: '#dc3545',
              border: '1px solid #dc3545',
              borderRadius: '10px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  // Connection interface
  return (
    <div style={{
      background: 'rgba(0, 123, 255, 0.1)',
      border: '2px solid #007bff',
      borderRadius: '20px',
      padding: '1rem',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🦊</div>
          <div>
            <h3 style={{ margin: '0', color: '#004085', fontSize: '1rem' }}>
              Connect Wallet
            </h3>
            <p style={{ margin: '0', color: '#004085', fontSize: '0.8rem' }}>
              Connect MetaMask to GRAIL
            </p>
          </div>
        </div>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            opacity: isConnecting ? 0.5 : 1
          }}
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
      </div>
      {error && (
        <div style={{
          marginTop: '0.5rem',
          color: '#721c24',
          fontSize: '0.8rem',
          background: 'rgba(248, 215, 218, 0.5)',
          padding: '0.5rem',
          borderRadius: '10px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default MetaMaskWallet;

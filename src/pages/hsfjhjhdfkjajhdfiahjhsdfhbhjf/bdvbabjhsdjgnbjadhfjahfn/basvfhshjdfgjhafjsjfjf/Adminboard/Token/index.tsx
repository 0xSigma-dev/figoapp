import React, { useState } from 'react';
import Cookies from 'js-cookie';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { Suspense, lazy } from 'react';
const ErrorModal = lazy(() => import('@/components/ErrorModal'));
const SuccessModal = lazy(() => import('@/components/SuccessModal'));

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const AddToken: React.FC = () => {
  const [symbol, setSymbol] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const addToken = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tokens/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          logoPath,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage('Token added successfully!');
        //console.log(data.token);
        // Reset the form
        setSymbol('');
        setLogoPath('');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Error adding token');
      }
    } catch (error) {
      setErrorMessage('Error adding token');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add a New Token</h1>
      <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Token Symbol"
          className="border p-2 w-full mb-4"
        />
        <input
          type="text"
          value={logoPath}
          onChange={(e) => setLogoPath(e.target.value)}
          placeholder="Logo Path (e.g., /logos/btc.png)"
          className="border p-2 w-full mb-4"
        />
        <button onClick={addToken} className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
          Add Token
        </button>
      </div>
  
      <Suspense fallback={<div>Loading...</div>}>
        {errorMessage && (
          <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
        )}
        {successMessage && (
          <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
        )}
      </Suspense>
    </div>
  );
  
};

export default AddToken;

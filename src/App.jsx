import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import InputSection from './components/InputSection'
import ResultSection from './components/ResultSection'

function App() {
  const [resultData, setResultData] = useState(null);
  const [productImages, setProductImages] = useState([]);

  const handleGenerate = (data, images) => {
    setResultData(data);
    setProductImages(images);
  };

  return (
    <div className="app">
      <Header />
      <InputSection onGenerate={handleGenerate} />
      {resultData && <ResultSection resultData={resultData} productImages={productImages} />}
    </div>
  )
}

export default App

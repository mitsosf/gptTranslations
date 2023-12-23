import React, {useEffect} from 'react';
import SummaryForm from './SummaryForm';
import 'antd/dist/reset.css';

const App = () => {
  useEffect(() => {
    document.title = 'Translation & Summary';
  }, []);
  return (
      <div className="App" style={{ margin: '2rem' }}>
        <h1>Translation & Summary App</h1>
        <SummaryForm />
      </div>
  );
};

export default App;

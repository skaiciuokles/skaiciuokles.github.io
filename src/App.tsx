import { TaxCalculatorPage } from './pages/tax-calculator';
import { BuildNumber } from './components/layouts/build-number';
import './index.css';

export function App() {
  return (
    <div className="max-w-480 mx-auto text-center relative z-10 h-screen">
      <TaxCalculatorPage />
      <BuildNumber />
    </div>
  );
}

export default App;

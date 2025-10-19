import React, { useState, useCallback } from 'react';
import { getDietRecommendation, DietPlan } from './services/geminiService';
import { Spinner } from './components/Spinner';
import { ResultCard } from './components/ResultCard';
import { ErrorAlert } from './components/ErrorAlert';

const App: React.FC = () => {
  const [hba1c, setHba1c] = useState<string>('');
  const [recommendation, setRecommendation] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const hba1cValue = parseFloat(hba1c);

    if (isNaN(hba1cValue) || hba1cValue <= 0 || hba1cValue > 25) {
      setError('الرجاء إدخال قيمة صالحة للسكر التراكمي (بين 1 و 25).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const result = await getDietRecommendation(hba1cValue);
      setRecommendation(result);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء الحصول على التوصية. قد تستغرق العملية وقتاً أطول بسبب إنشاء الصور. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [hba1c]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-teal-600">مستشار الحمية الغذائية</h1>
          <p className="text-lg text-gray-600 mt-2">أدخل مستوى السكر التراكمي (HbA1c) للحصول على خطة غذائية مخصصة ومدعومة بالصور</p>
        </header>

        <main>
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
            <form onSubmit={handleSubmit}>
              <label htmlFor="hba1c-input" className="block text-lg font-medium text-gray-700 mb-2">
                مستوى السكر التراكمي (HbA1c %)
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  id="hba1c-input"
                  type="number"
                  step="0.1"
                  value={hba1c}
                  onChange={(e) => setHba1c(e.target.value)}
                  placeholder="مثال: 5.7"
                  className="flex-grow w-full px-4 py-3 text-lg text-gray-700 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  required
                  aria-label="مستوى السكر التراكمي"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3 text-lg font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {isLoading ? 'جاري التحليل وإنشاء الصور...' : 'تحليل'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8">
            {isLoading && <Spinner />}
            {error && <ErrorAlert message={error} />}
            {recommendation && <ResultCard data={recommendation} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

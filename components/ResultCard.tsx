import React from 'react';
import { DietPlan } from '../services/geminiService';

interface ResultCardProps {
  data: DietPlan;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-3xl font-bold text-teal-700 border-b-2 border-teal-200 pb-2 mb-4">{title}</h2>
    {children}
  </section>
);

const MealCard: React.FC<{ name: string; imageUrl?: string }> = ({ name, imageUrl }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-transform transform hover:scale-105">
        <img src={imageUrl} alt={name} className="w-full h-40 object-cover" />
        <div className="p-4">
            <h4 className="font-bold text-lg text-gray-800">{name}</h4>
        </div>
    </div>
);


export const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 animate-fade-in">
      <div className="prose prose-lg max-w-none prose-teal">
        
        <Section title={`تحليل المستوى: ${data.analysis.level}`}>
          <p className="text-gray-700 leading-relaxed">{data.analysis.explanation}</p>
        </Section>
        
        <Section title="الأهداف الرئيسية للحمية">
          <ul className="list-disc list-inside space-y-2">
            {data.mainGoals.map((goal, index) => <li key={index} className="text-gray-700">{goal}</li>)}
          </ul>
        </Section>
        
        <Section title="خطة غذائية مقترحة">
            {Object.entries(data.mealPlan).map(([mealType, meals]) => (
                <div key={mealType} className="mb-6">
                    <h3 className="text-2xl font-semibold text-teal-600 capitalize mb-4">
                        {mealType === 'breakfast' ? 'الإفطار' : mealType === 'lunch' ? 'الغداء' : mealType === 'dinner' ? 'العشاء' : 'وجبات خفيفة'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Fix: Add Array.isArray check to prevent mapping on non-array values. */}
                        {Array.isArray(meals) && meals.map((meal, index) => <MealCard key={index} name={meal.name} imageUrl={meal.imageUrl} />)}
                    </div>
                </div>
            ))}
        </Section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Section title="أطعمة موصى بها">
              <ul className="list-disc list-inside space-y-2">
                {data.recommendedFoods.map((food, index) => <li key={index} className="text-gray-700">{food}</li>)}
              </ul>
            </Section>
            
            <Section title="أطعمة يجب تجنبها">
              <ul className="list-disc list-inside space-y-2">
                {data.avoidFoods.map((food, index) => <li key={index} className="text-gray-700">{food}</li>)}
              </ul>
            </Section>
        </div>

        <Section title="نصائح لنمط حياة صحي">
           <ul className="list-disc list-inside space-y-2">
                {data.lifestyleTips.map((tip, index) => <li key={index} className="text-gray-700">{tip}</li>)}
            </ul>
        </Section>

        <div className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-lg" role="alert">
            <p className="font-bold">تنبيه هام:</p>
            <p>هذه المعلومات هي إرشادية فقط ولا تغني إطلاقًا عن استشارة الطبيب المختص أو أخصائي التغذية. يجب وضع أي خطة علاجية أو غذائية تحت إشراف طبي.</p>
        </div>
      </div>
    </div>
  );
};
import React from 'react';

export interface TestUnusedProps {
  title: string;
}

export const TestUnused: React.FC<TestUnusedProps> = ({ title }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      <p>Questo è un componente di test che non verrà mai utilizzato.</p>
    </div>
  );
};

export const TestUnusedFunction = () => {
  return "Questa funzione non verrà mai utilizzata";
};

export const TEST_UNUSED_CONSTANT = "Questa costante non verrà mai utilizzata"; 
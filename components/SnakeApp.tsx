import React from 'react';
import SnakeGame from './SnakeGame';

const SnakeApp: React.FC = () => {
  return (
    <div className="w-full h-full bg-black">
      <SnakeGame />
    </div>
  );
};

export default SnakeApp;

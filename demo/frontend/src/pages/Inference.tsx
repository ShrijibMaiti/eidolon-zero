import React from 'react';
import SplitBrainChat from '../components/inference/SplitBrainChat';

const Inference: React.FC = () => {
  return (
    <div className="h-full w-full overflow-hidden">
      <SplitBrainChat />
    </div>
  );
};

export default Inference;

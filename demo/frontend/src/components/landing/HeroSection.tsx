import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { MoveRight } from 'lucide-react';
import DecorationLayer from '../shared/DecorationLayer';
import CornerLabels from './CornerLabels';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center pt-[5vh] px-4 overflow-hidden">
      <DecorationLayer />
      <CornerLabels />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center z-10"
      >
        <h1 className="hero-text text-text-primary text-center mb-6">
          EIDOLON:ZERO
        </h1>
        
        <p className="body-text text-text-secondary text-center max-w-[680px] mb-10 leading-loose">
          A dynamic AI inference engine that generates custom LoRA
          weights on the fly using a Hypernetwork, injecting them
          into a base LLM in real-time based on your selected domain.
        </p>

        <motion.button
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative w-[420px] h-[64px] bg-[#F2F2F2] text-[#050505] rounded-[2px] transition-all hover:bg-white flex items-center justify-between px-8 font-bold tracking-[0.12em] uppercase text-sm"
        >
          <span>Enter the Engine</span>
          <MoveRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default HeroSection;

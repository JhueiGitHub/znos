// /root/app/apps/flow/components/Live.tsx
import { useEffect } from "react";
import { fabric } from "fabric";
import { useOthers } from "@/liveblocks.config";

// /root/app/apps/flow/components/Live.tsx
interface LiveProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onTransform: (matrix: number[]) => void;
  canvasSize: { width: number; height: number };
}

// /root/app/apps/flow/components/Live.tsx
const Live = ({ canvasRef, onTransform }: {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    onTransform: (matrix: number[]) => void;
  }) => {
    const others = useOthers();
  
    useEffect(() => {
      if (!canvasRef.current) return;
  
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 'transparent',
        selection: true
      });
  
      let isDragging = false;
      let lastPosX = 0;
      let lastPosY = 0;
  
      const handleResize = () => {
        canvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
        canvas.renderAll();
      };
  
      canvas.on('mouse:down', (opt) => {
        const evt = opt.e as MouseEvent;
        if (evt.altKey) {
          isDragging = true;
          canvas.selection = false;
          lastPosX = evt.clientX;
          lastPosY = evt.clientY;
          canvas.defaultCursor = 'grabbing';
        }
      });
  
      canvas.on('mouse:move', (opt) => {
        if (isDragging) {
          const evt = opt.e as MouseEvent;
          const vpt = canvas.viewportTransform!;
          vpt[4] += evt.clientX - lastPosX;
          vpt[5] += evt.clientY - lastPosY;
          canvas.requestRenderAll();
          lastPosX = evt.clientX;
          lastPosY = evt.clientY;
          onTransform(vpt);
        }
      });
  
      canvas.on('mouse:up', () => {
        isDragging = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
      });
  
      window.addEventListener('resize', handleResize);
      
      return () => {
        canvas.dispose();
        window.removeEventListener('resize', handleResize);
      };
    }, [onTransform]);
  
    return (
      <>
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full" 
        />
        <div className="fixed top-4 right-20 text-[#cccccc]/70 text-xs">
          {others.length} other user{others.length === 1 ? '' : 's'} present
        </div>
      </>
    );
  };

export default Live;

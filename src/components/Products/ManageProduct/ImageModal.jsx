import { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Move } from "lucide-react";

const ImageModal = ({ imageUrl, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const modalContentRef = useRef(null);

  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      if (modalContentRef.current) {
        modalContentRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (modalContentRef.current) {
      modalContentRef.current.style.cursor = 'grab';
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    } else if (e.touches.length === 2) {
      const touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
      const currentDistance = Math.hypot(
        touch1.x - touch2.x,
        touch1.y - touch2.y
      );

      const initialDistanceRef = { current: currentDistance };
      const initialZoomRef = { current: zoomLevel };

      const handleTouchMove = (moveEvent) => {
        if (moveEvent.touches.length !== 2) return;

        const newTouch1 = { x: moveEvent.touches[0].clientX, y: moveEvent.touches[0].clientY };
        const newTouch2 = { x: moveEvent.touches[1].clientX, y: moveEvent.touches[1].clientY };
        const newDistance = Math.hypot(
          newTouch1.x - newTouch2.x,
          newTouch1.y - newTouch2.y
        );

        const zoomChange = newDistance / initialDistanceRef.current;
        const newZoom = Math.min(Math.max(initialZoomRef.current * zoomChange, 0.5), 3);
        setZoomLevel(newZoom);
      };

      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[2000] p-4"
      onWheel={handleWheel}
    >
      <div
        ref={modalContentRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-2 max-w-[90vw] max-h-[90vh] w-auto h-auto relative overflow-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
      >
        {/* Zoom Controls */}
        <div className="absolute top-2 right-2 z-10 flex space-x-2 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-md">
          <button
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={resetZoom}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
            title="Reset Zoom"
          >
            <Move className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500 hover:text-red-700"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Zoomed Image */}
        <div className="w-full h-full overflow-hidden flex items-center justify-center">
          <div
            ref={imageRef}
            className="transform-origin-center transition-transform duration-100 ease-out"
            style={{
              transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
              willChange: 'transform'
            }}
          >
            <img
              src={imageUrl}
              alt="Product Preview"
              className="max-w-none max-h-[80vh] object-contain select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

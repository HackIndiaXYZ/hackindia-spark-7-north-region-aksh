import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

const Globe3DDemo = () => {
  const globeRef = useRef();
  const containerRef = useRef();
  const [arcsData, setArcsData] = useState([]);
  const [pointsData, setPointsData] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth || 600,
          height: clientHeight || 600
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Generate validator points
    const validators = [...Array(120).keys()].map(() => ({
      lat: (Math.random() - 0.5) * 180,
      lng: (Math.random() - 0.5) * 360,
      size: Math.random() * 0.4 + 0.1,
      color: ['#00ffff', '#ffffff', '#8b5cf6'][Math.floor(Math.random() * 3)],
    }));
    setPointsData(validators);

    // Initial arcs
    const initialArcs = [...Array(20).keys()].map(() => {
      const start = validators[Math.floor(Math.random() * validators.length)];
      const end = validators[Math.floor(Math.random() * validators.length)];
      return {
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng,
        color: start.color,
      };
    });
    setArcsData(initialArcs);

    // Dynamic arcs update - balanced "connecting the lights" sequentially
    const arcInterval = setInterval(() => {
      setArcsData(prev => {
        const start = validators[Math.floor(Math.random() * validators.length)];
        const end = validators[Math.floor(Math.random() * validators.length)];
        const newArc = {
          startLat: start.lat,
          startLng: start.lng,
          endLat: end.lat,
          endLng: end.lng,
          color: start.color,
        };
        // Balanced density for a clean, active network
        return [...prev, newArc].slice(-40);
      });
    }, 800);

    // Interaction and auto-rotate settings
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = true;
      controls.minDistance = 320;
      controls.maxDistance = 500;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Handle auto-rotation pause/resume
      const onStart = () => { controls.autoRotate = false; };
      const onEnd = () => { controls.autoRotate = true; };

      controls.addEventListener('start', onStart);
      controls.addEventListener('end', onEnd);

      return () => {
        window.removeEventListener('resize', handleResize);
        controls.removeEventListener('start', onStart);
        controls.removeEventListener('end', onEnd);
        clearInterval(arcInterval);
      };
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(arcInterval);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-auto cursor-grab active:cursor-grabbing">
      <Globe
        ref={globeRef}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        // Points (Validators)
        pointsData={pointsData}
        pointColor="color"
        pointAltitude={0.01}
        pointRadius="size"
        pointsMerge={true}
        
        // Arcs (Network Traffic)
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={4}
        arcDashAnimateTime={2000}
        arcStroke={0.4}
        
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.1}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
};

export default Globe3DDemo;

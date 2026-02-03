import React, { useEffect, useRef } from 'react';

interface PixelGridProps {
    className?: string;
}

const PixelGrid: React.FC<PixelGridProps> = ({ className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width: number;
        let height: number;
        const pixelSize = 12;
        const gap = 4;
        const gridSize = pixelSize + gap;
        const particles: { x: number; y: number; alpha: number; targetAlpha: number }[] = [];

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            const columns = Math.ceil(width / gridSize);
            const rows = Math.ceil(height / gridSize);

            particles.length = 0;
            for (let c = 0; c < columns; c++) {
                for (let r = 0; r < rows; r++) {
                    if (Math.random() > 0.85) {
                        particles.push({
                            x: c * gridSize,
                            y: r * gridSize,
                            alpha: 0,
                            targetAlpha: Math.random() * 0.4
                        });
                    }
                }
            }
        };

        window.addEventListener('resize', resize);
        resize();

        const mouse = { x: -1000, y: -1000 };
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let currentAlpha = p.alpha;

                if (dist < 150) {
                    currentAlpha = Math.min(0.8, p.alpha + (150 - dist) / 150);
                } else {
                    p.alpha += (p.targetAlpha - p.alpha) * 0.02;
                    if (Math.abs(p.alpha - p.targetAlpha) < 0.01) {
                        p.targetAlpha = Math.random() * 0.4;
                    }
                    currentAlpha = p.alpha;
                }

                ctx.fillStyle = `rgba(16, 185, 129, ${currentAlpha})`; // Trae green
                ctx.fillRect(p.x, p.y, pixelSize, pixelSize);
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none z-0 ${className}`}
            style={{ opacity: 0.5 }}
        />
    );
};

export default PixelGrid;

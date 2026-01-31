import React, { useLayoutEffect, useRef, useCallback, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';

// --- Singleton Lenis Manager ---
// This ensures we only have ONE Lenis instance controlling the window scroll
// even if we have multiple ScrollStacks on the page.
let globalLenis: Lenis | null = null;
let globalLenisSubscribers = 0;
let globalRafId: number | null = null;

const startGlobalLenis = () => {
    if (!globalLenis) {
        globalLenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            infinite: false,
        });

        const rf = (time: number) => {
            globalLenis?.raf(time);
            globalRafId = requestAnimationFrame(rf);
        };
        globalRafId = requestAnimationFrame(rf);
    }
    globalLenisSubscribers++;
    return globalLenis;
};

const stopGlobalLenis = () => {
    globalLenisSubscribers--;
    if (globalLenisSubscribers <= 0 && globalLenis) {
        if (globalRafId) cancelAnimationFrame(globalRafId);
        globalLenis.destroy();
        globalLenis = null;
        globalRafId = null;
    }
};
// -------------------------------

export interface ScrollStackItemProps {
    itemClassName?: string;
    children: ReactNode;
    i?: number;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
    <div
        className={`scroll-stack-card relative w-full h-[320px] md:h-[500px] my-2 md:my-8 p-6 md:p-12 rounded-[2rem] md:rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.1)] box-border origin-top will-change-transform ${itemClassName}`.trim()}
        style={{
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d'
        }}
    >
        {children}
    </div>
);

interface ScrollStackProps {
    className?: string;
    children: ReactNode;
    itemScale?: number;
    itemStackDistance?: number;
    stackPosition?: string;
    scaleEndPosition?: string;
    baseScale?: number;
    rotationAmount?: number;
    blurAmount?: number;
    useWindowScroll?: boolean;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
    children,
    className = '',
    itemScale = 0.03,
    itemStackDistance = 60,
    stackPosition = '20%',
    scaleEndPosition = '10%',
    baseScale = 0.85,
    rotationAmount = 0,
    blurAmount = 0,
    useWindowScroll = true,
}) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLElement[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const effectiveBaseScale = isMobile ? 0.94 : baseScale;
    const effectiveItemStackDistance = isMobile ? 20 : itemStackDistance;

    // Cache layout metrics
    const layoutCache = useRef<{
        cardTops: number[];
        endElementTop: number;
        containerHeight: number;
        stackPositionPx: number;
        scaleEndPositionPx: number;
    }>({
        cardTops: [],
        endElementTop: 0,
        containerHeight: 0,
        stackPositionPx: 0,
        scaleEndPositionPx: 0
    });

    const parsePercentage = (value: string | number, containerHeight: number) => {
        if (typeof value === 'string' && value.includes('%')) {
            return (parseFloat(value) / 100) * containerHeight;
        }
        return parseFloat(value as string);
    };

    const measureLayout = useCallback(() => {
        if (!scrollerRef.current) return;

        const containerHeight = useWindowScroll ? window.innerHeight : scrollerRef.current.clientHeight;
        const scrollY = useWindowScroll ? window.scrollY : scrollerRef.current.scrollTop;

        const endElement = useWindowScroll
            ? (scrollerRef.current.querySelector('.scroll-stack-end') as HTMLElement | null)
            : (scrollerRef.current.querySelector('.scroll-stack-end') as HTMLElement | null);
        // Note: For window scroll, previous code looked in document. 
        // But if we have multiple stacks, looking in document found the FIRST stack's end.
        // FIX: Look inside scrollerRef (which is the wrapper)

        const endRectTop = endElement ? endElement.getBoundingClientRect().top + scrollY : 0;

        const cardTops = cardsRef.current.map(card => {
            return card.getBoundingClientRect().top + scrollY;
        });

        layoutCache.current = {
            cardTops,
            endElementTop: endRectTop,
            containerHeight,
            stackPositionPx: parsePercentage(stackPosition, containerHeight),
            scaleEndPositionPx: parsePercentage(scaleEndPosition, containerHeight),
        };
    }, [stackPosition, scaleEndPosition, useWindowScroll]);

    const updateCardTransforms = (scrollTop: number) => {
        const { cardTops, endElementTop, containerHeight, stackPositionPx, scaleEndPositionPx } = layoutCache.current;
        if (!cardsRef.current.length) return;

        cardsRef.current.forEach((card, i) => {
            const cardTop = cardTops[i];
            if (cardTop === undefined) return;

            const triggerStart = cardTop - stackPositionPx - effectiveItemStackDistance * i;
            const triggerEnd = cardTop - scaleEndPositionPx;
            const pinStart = cardTop - stackPositionPx - effectiveItemStackDistance * i;
            const pinEnd = endElementTop - containerHeight / 2;

            let scaleProgress = 0;
            if (scrollTop > triggerStart && scrollTop < triggerEnd) {
                scaleProgress = (scrollTop - triggerStart) / (triggerEnd - triggerStart);
            } else if (scrollTop >= triggerEnd) {
                scaleProgress = 1;
            }

            const targetScale = effectiveBaseScale + i * itemScale;
            const scale = 1 - scaleProgress * (1 - targetScale);
            const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

            let translateY = 0;
            const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
            if (isPinned) {
                translateY = scrollTop - cardTop + stackPositionPx + effectiveItemStackDistance * i;
            } else if (scrollTop > pinEnd) {
                translateY = pinEnd - cardTop + stackPositionPx + effectiveItemStackDistance * i;
            }

            const transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${rotation.toFixed(3)}deg)`;
            card.style.transform = transform;
        });
    };

    useLayoutEffect(() => {
        const container = scrollerRef.current;
        // Scope querySelector to this container to handle multiple stacks correctly
        const cards = Array.from(
            container?.querySelectorAll('.scroll-stack-card') ?? []
        ) as HTMLElement[];
        cardsRef.current = cards;

        measureLayout();

        const handleResize = () => {
            measureLayout();
            updateCardTransforms(window.scrollY);
        };
        window.addEventListener('resize', handleResize);

        let lenis: Lenis | null = null;
        let localRafId: number | null = null;

        if (useWindowScroll) {
            // Use Shared Global Lenis
            lenis = startGlobalLenis();

            // Hook into the shared instance's scroll event
            // Note: Lenis emits 'scroll' on every frame if scrolling
            const onScroll = (e: any) => {
                updateCardTransforms(e.scroll);
            };
            lenis.on('scroll', onScroll);

            // Force initial update
            updateCardTransforms(lenis.scroll || window.scrollY);

            return () => {
                lenis?.off('scroll', onScroll);
                window.removeEventListener('resize', handleResize);
                stopGlobalLenis();
            };
        } else {
            // Local Lenis (keep disjoint)
            lenis = new Lenis({
                wrapper: container as HTMLElement,
                content: container?.querySelector('.scroll-stack-inner') as HTMLElement,
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                infinite: false,
            });

            const onScroll = (e: any) => {
                updateCardTransforms(e.scroll);
            };
            lenis.on('scroll', onScroll);

            const raf = (time: number) => {
                lenis?.raf(time);
                localRafId = requestAnimationFrame(raf);
            };
            localRafId = requestAnimationFrame(raf);

            return () => {
                if (localRafId) cancelAnimationFrame(localRafId);
                lenis?.destroy();
            };
        }
    }, [
        measureLayout,
        itemStackDistance,
        itemScale,
        baseScale,
        rotationAmount,
        blurAmount,
        useWindowScroll
    ]);

    return (
        <div
            className={`relative w-full ${useWindowScroll ? 'h-auto overflow-visible' : 'h-full overflow-y-auto overflow-x-hidden'} ${className}`.trim()}
            ref={scrollerRef}
            style={{
                overscrollBehavior: 'contain',
            }}
        >
            <div className={`scroll-stack-inner relative px-2 md:px-6 ${useWindowScroll ? 'pt-[5vh] pb-[10vh] md:pt-[20vh] md:pb-[20vh]' : 'pt-[30px] pb-[10rem] md:pt-[100px] md:pb-[30rem]'}`}>
                {children}
                {/* 
                We place the end-marker INSIDE the wrapper. 
                Crucial for multiple stacks: Logic looks for .scroll-stack-end inside scrollerRef.
            */}
                <div className="scroll-stack-end w-full h-px" />
            </div>
        </div>
    );
};

export default ScrollStack;

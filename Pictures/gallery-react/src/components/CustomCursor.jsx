import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
    const dotRef = useRef(null);
    const circleRef = useRef(null);

    useEffect(() => {
        const moveCursor = (e) => {
            gsap.to(dotRef.current, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1
            });
            gsap.to(circleRef.current, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.3
            });
        };

        const handleMouseDown = () => {
            gsap.to(circleRef.current, {
                scale: 0.5,
                duration: 0.2
            });
        };

        const handleMouseUp = () => {
            gsap.to(circleRef.current, {
                scale: 1,
                duration: 0.2
            });
        };

        const handleHover = (e) => {
            if (e.target.closest('a, button, .collection-item, .thumbnail')) {
                gsap.to(circleRef.current, {
                    scale: 1.5,
                    backgroundColor: 'rgba(255, 107, 0, 0.1)',
                    duration: 0.3
                });
            } else {
                gsap.to(circleRef.current, {
                    scale: 1,
                    backgroundColor: 'transparent',
                    duration: 0.3
                });
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseover', handleHover);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseover', handleHover);
        };
    }, []);

    return (
        <>
            <div ref={dotRef} className="cursor-dot"></div>
            <div ref={circleRef} className="cursor-circle"></div>
        </>
    );
};

export default CustomCursor;

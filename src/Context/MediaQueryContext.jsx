import React, { createContext, useState, useEffect } from 'react';
export const MediaQueryContext = createContext();

function MediaQueryProvider({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1280);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1280);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <MediaQueryContext.Provider value={{ isMobile }}>{children}</MediaQueryContext.Provider>;
}
export default MediaQueryProvider;

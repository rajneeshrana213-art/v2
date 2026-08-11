import React from 'react';
import { NextPageContext } from 'next';

interface ErrorProps {
    statusCode?: number;
    title?: string;
    err?: any;
}

function Error({ statusCode, title, err }: ErrorProps) {
    React.useEffect(() => {
        if (err || statusCode) {
            const report = {
                message: err?.message || title || `Error ${statusCode}`,
                stack: err?.stack || 'No stack trace',
                component: 'NextJSErrorPage',
                url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
                additionalInfo: {
                    statusCode,
                    timestamp: new Date().toISOString()
                }
            };

            fetch('/api/v1/report-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            }).catch(e => console.error("Failed to report NextJS error:", e));
        }
    }, [err, statusCode, title]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#071B2C',
            color: 'white',
            fontFamily: 'sans-serif'
        }}>
            <h1 style={{ fontSize: '4rem', margin: '0' }}>{statusCode || 'Error'}</h1>
            <p style={{ fontSize: '1.2rem', color: '#9FB3C8' }}>{title || 'An unexpected error occurred'}</p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#2C81B4',
                    border: 'none',
                    borderRadius: '5px',
                    color: 'white',
                    cursor: 'pointer'
                }}
            >
                Reload Page
            </button>
        </div>
    );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode, err };
};

export default Error;

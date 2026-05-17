// Tooltip.jsx
import { useState } from 'react';

export default function Tooltip({ children, text }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            backgroundColor: '#d36a6a',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {text}
          {/* Optional: small arrow */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '5px',
              borderStyle: 'solid',
              borderColor: '#333 transparent transparent transparent',
            }}
          />
        </div>
      )}
    </div>
  );
}
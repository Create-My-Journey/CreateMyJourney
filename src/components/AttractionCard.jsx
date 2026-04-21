import { useState } from 'react';

export default function AttractionCard({ attraction }) {
  // This state tracks if the image is currently showing
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ marginBottom: '24px', paddingBottom: '16px' }}>
      
      {/* Top Row: Checkbox, Text, and Toggle Button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <input type="checkbox" style={{ marginTop: '5px', cursor: 'pointer' }} />
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1em', color: '#333' }}>
              {attraction.title}
            </h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>
              {attraction.description}
            </p>
          </div>
        </div>

        {/* The Toggle Button */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '1.5em',
            padding: '0 10px'
          }}
        >
          {isExpanded ? '⌃' : '⌄'}
        </button>
      </div>

      {/* Conditionally render the image based on the isExpanded state */}
      {isExpanded && (
        <div style={{ marginTop: '16px', paddingLeft: '28px' }}>
          <img 
            src={attraction.imageUrl} 
            alt={attraction.title} 
            style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '8px' 
            }} 
          />
        </div>
      )}
    </div>
  );
}


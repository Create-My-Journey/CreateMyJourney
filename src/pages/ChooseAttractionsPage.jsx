import AttractionCard from '../components/AttractionCard';
import { placeholderAttractions } from '../data/placeholders';

export default function ChooseAttractionsPage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      
      <h1 style={{ fontSize: '2.5em', fontWeight: 'bold', marginBottom: '40px' }}>
        Choose Attractions
      </h1>

      <div style={{ display: 'flex', gap: '60px' }}>
        
        {/* Left Column: The Attractions List */}
        <div style={{ flex: '2' }}>
          {placeholderAttractions.map((attraction) => (
            <AttractionCard key={attraction.id} attraction={attraction} />
          ))}
        </div>

        {/* Right Column: Sorting and Filtering Controls */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Sort By */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: '500' }}>Sort By</span>
              <span>↗</span>
            </div>
            <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option>Value</option>
            </select>
          </div>

          {/* Filter By */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontWeight: '500' }}>Filter By</span>
              <span>⧨</span>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', color: '#555', marginBottom: '8px' }}>
                <span>Budget</span>
                <span>$0-100</span>
              </div>
              <input type="range" style={{ width: '100%' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', color: '#555', marginBottom: '8px' }}>
                <span>Review Score</span>
                <span>0-5</span>
              </div>
              <input type="range" style={{ width: '100%' }} />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '60px' }}>
        <button style={{ 
          padding: '14px 28px', 
          backgroundColor: '#2a2a2a', 
          color: 'white', 
          borderRadius: '12px', 
          border: 'none', 
          fontSize: '1em',
          cursor: 'pointer' 
        }}>
          Skip Attractions
        </button>
        <button style={{ 
          padding: '14px 28px', 
          backgroundColor: '#2a2a2a', 
          color: 'white', 
          borderRadius: '12px', 
          border: 'none', 
          fontSize: '1em',
          cursor: 'pointer' 
        }}>
          Confirm
        </button>
      </div>

    </div>
  );
}


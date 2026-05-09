// test-restaurants.js

// ⚠️ IMPORTANT: For testing, you can paste your key here.
// For production, ALWAYS use environment variables (e.g., process.env.GOOGLE_MAPS_API_KEY)
const API_KEY = 'AIzaSyBvgC5e7Ame0D6so2f9VuVVu_-woem7vic'; 
const CITY = 'Regie Bucuresti'; // Change this to test different citiesc

async function getRestaurants(city) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  const payload = {
    textQuery: `restaurants in ${city}`
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': API_KEY,
    // FieldMask dictates what data is returned. Add/remove fields to manage billing.
    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.priceLevel'
  };

  try {
    console.log(`Fetching restaurants in ${city}...\n`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP Error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Parse and log the results cleanly
    if (data.places && data.places.length > 0) {
      console.log(`✅ Found ${data.places.length} restaurants:\n`);
      
      data.places.forEach((place, index) => {
        const name = place.displayName?.text || 'Unknown Name';
        const address = place.formattedAddress || 'No address provided';
        const rating = place.rating ? `${place.rating} / 5.0` : 'No rating';
        const price = place.priceLevel || 'Price not listed';

        console.log(`${index + 1}. ${name}`);
        console.log(`   📍 Address: ${address}`);
        console.log(`   ⭐ Rating:  ${rating}`);
        console.log(`   💲 Price:   ${price}`);
        console.log('   -----------------------------------');
      });
    } else {
      console.log(`No restaurants found in ${city}.`);
    }

  } catch (error) {
    console.error('❌ Error fetching data:\n', error.message);
  }
}

// Execute the function
getRestaurants(CITY);
import ChooseAttractions from './pages/ChooseAttractions'
import './App.css'

function App() {
  return (
    <ChooseAttractions
      navigate={(page) => console.log('navigate to:', page)}
      user={null}
      login={() => {}}
      logout={() => {}}
      tripData={{ location: 'Tokyo, Japan', nights: 7, people: 2 }}
    />
  )
}

export default App
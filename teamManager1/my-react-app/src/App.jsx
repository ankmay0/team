import TeamMaker from "./components/TeamMaker"; 
import DummyData from "../public/DummyData";   
// import AGGridExample from "./components/AGGridExample";

function App() {

  return (
    <div className="App">
      <TeamMaker
        teams={DummyData}
      />
      {/* <AGGridExample /> */}
    </div>
  );
}

export default App;

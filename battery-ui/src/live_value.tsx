import React from 'react';
import './App.css';

interface TemperatureProps {
  temp: number;
}

function LiveValue({ temp } : TemperatureProps) {

  
  let valueColour = 'white';

  if (temp < 20 || temp > 80) {
    valueColour = "Red";
  } else {
    valueColour = "Green";
  }

  return (
      <header className="live-value" style={{ color : valueColour, transition: "all .5s ease"}}>
        {`${temp.toString()}°C`}
      </header>
  );
}

export default LiveValue;
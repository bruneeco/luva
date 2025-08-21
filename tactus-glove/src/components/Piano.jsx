import "./Piano.css";

export default function Piano() {
  const whiteKeys = ["Dó","Ré","Mi","Fá","Sol","Lá","Si","Dó","Ré","Mi","Fá","Sol","Lá","Si"];
  const blackKeys = [1, 2, 4, 5, 6, 8, 9, 11]; 

  return (
    <div className="piano-container">
      <div className="piano">
        {whiteKeys.map((nota, i) => (
          <div key={i} className="white-key">
            <span className="key-number">{i+1}</span>
            <span className="note-name">{nota}</span>
            {blackKeys.includes(i) && <div className="black-key"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

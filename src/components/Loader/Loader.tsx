import "./Loader.css";

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-card">
        <div className="loader-logo">
          <div className="loader-circle"></div>
        </div>

        <h2>TaskMe</h2>

        <p>Chargement de votre espace...</p>

        <div className="loader-bar">
          <div className="loader-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
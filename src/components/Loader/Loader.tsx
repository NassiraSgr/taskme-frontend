import "./Loader.css";

interface LoaderProps {
  title?: string;
  message?: string;
}

const Loader = ({
  title = "TaskMe",
  message = "Chargement..."
}: LoaderProps) => {
  return (
    <div className="loader-container">
      <div className="loader-card">
        <div className="loader-logo">
          <div className="loader-circle"></div>
        </div>

        <h2>{title}</h2>

        <p>{message}</p>

        <div className="loader-bar">
          <div className="loader-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
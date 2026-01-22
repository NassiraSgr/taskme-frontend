import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="btn btn-outline-secondary"
      style={{ height: "38px" }}
      onClick={toggleTheme}
    >
      {theme === "light" ? "Mode Sombre" : "Mode Clair"}
    </button>
  );
};

export default ThemeToggle;

const Footer = () => {
  return (
    <footer className="bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-4 px-6 text-center space-y-2">
      <p>© 2025 - Tous droits réservés - TaskMe</p>
      <p className="text-sm">
        <a
          href="https://example.com/mentions"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-500"
        >
          Mentions légales
        </a>{" "}
        —{" "}
        <a
          href="https://example.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-500"
        >
          Politique de confidentialité
        </a>{" "}
        —{" "}
        <a
          href="https://example.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-500"
        >
          Conditions d’utilisation
        </a>
      </p>
    </footer>
  );
};

export default Footer;

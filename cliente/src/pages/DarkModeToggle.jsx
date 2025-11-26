import { useEffect, useState } from "react";

function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded bg-gray-200 dark:bg-gray-800 hover:cursor-pointer"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

export default DarkModeToggle;

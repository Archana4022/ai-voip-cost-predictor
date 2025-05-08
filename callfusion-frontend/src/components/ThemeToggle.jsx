// src/components/ThemeToggle.jsx
import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('bg-dark', dark);
    document.body.classList.toggle('text-white', dark);
  }, [dark]);

  return (
    <div className="form-check form-switch mb-3">
      <input
        className="form-check-input"
        type="checkbox"
        id="themeSwitch"
        checked={dark}
        onChange={() => setDark(!dark)}
      />
      <label className="form-check-label" htmlFor="themeSwitch">
        {dark ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </label>
    </div>
  );
};

export default ThemeToggle;

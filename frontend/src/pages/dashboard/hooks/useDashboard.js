import { useState } from "react";

const useDashboard = () => {
  const [activeView, setActiveView] = useState("home"); // 'home' or 'sessions'

  return { activeView, setActiveView };
};

export default useDashboard;

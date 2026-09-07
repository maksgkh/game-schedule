import { useEffect, useState } from "react";

interface Props {
  title: string;
  message: string;
  onClose: () => void;
}

export default function Toast({ title, message, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Ждем окончания анимации
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${visible ? "show" : ""}`}>
      <div className="toast-icon">🔔</div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
      </div>
      <button className="toast-close" onClick={() => { setVisible(false); setTimeout(onClose, 300); }}>×</button>
    </div>
  );
}
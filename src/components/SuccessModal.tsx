interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function SuccessModal({ isOpen, onClose, message }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div
        className="cyber-card"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '40px',
          textAlign: 'center',
          position: 'relative',
          animation: 'fadeIn 0.3s ease-in-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          fontSize: '64px',
          marginBottom: '20px',
          filter: 'drop-shadow(0 0 20px var(--neon-green))'
        }}>
          ✓
        </div>

        <h2 style={{
          fontSize: '28px',
          marginBottom: '20px',
          color: 'var(--neon-green)'
        }}>
          Заявка отправлена!
        </h2>

        <p style={{
          fontSize: '18px',
          lineHeight: '1.7',
          opacity: 0.9,
          marginBottom: '30px'
        }}>
          {message}
        </p>

        <button
          onClick={onClose}
          className="cyber-button"
          style={{
            width: '100%',
            fontSize: '16px'
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}

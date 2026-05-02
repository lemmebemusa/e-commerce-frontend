import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  headerContent,
  footerContent,
  showHeader = true,
  showCloseButton = true,
  animate = true,
  className = ''
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

const sheetStyle = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    backgroundColor: 'white',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    transform: animate ? (isOpen ? 'translateY(0)' : 'translateY(100%)') : undefined,
    transition: animate ? 'transform 300ms' : undefined,
    overflow: 'hidden',
  };

  const headerStyle = {
    backgroundColor: 'white',
    padding: '16px',
    display: 'flex',
    justifyContent: 'flex-end',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
  };

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 50,
    display: isOpen ? 'block' : 'none',
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={sheetStyle} className={className}>
        {showHeader && (
          <div style={headerStyle}>
            {headerContent ? headerContent : (
              showCloseButton && (
                <button
                  onClick={onClose}
                  style={{ padding: '8px', borderRadius: '9999px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              )
            )}
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '24px' }}>
          {title && <h2 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>{title}</h2>}
          {children}
        </div>
        {footerContent && (
          <div style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', paddingTop: '16px', paddingBottom: '24px', paddingLeft: '24px', paddingRight: '24px', borderTop: '1px solid rgb(243 244 246)' }}>
            {footerContent}
          </div>
        )}
      </div>
    </>
  );
}
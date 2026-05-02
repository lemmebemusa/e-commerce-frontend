import { IosSpinner } from 'ios-spinner';

export default function LoadingSpinner({ size = 'medium', className = '' }) {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center min-h-[50vh] ${className}`}>
      <IosSpinner className={sizeClasses[size]} />
    </div>
  );
}
export default function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  className = '',
  ...props 
}) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200'
  
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50'
  }

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
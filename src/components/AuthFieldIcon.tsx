interface AuthFieldIconProps {
  type: 'user' | 'lock' | 'email'
}

export default function AuthFieldIcon({ type }: AuthFieldIconProps) {
  const path =
    type === 'user'
      ? 'M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'
      : type === 'lock'
        ? 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10Z'
        : 'M4 5h16v14H4V5Zm0 1 8 6 8-6'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

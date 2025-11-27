export const XIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ffffff44" />
      </filter>
    </defs>

    <path
      d="M4 4L12 12M12 4L4 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      filter="url(#glow)"
    />
  </svg>
);
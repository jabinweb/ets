// Convert hex to HSL for CSS variables
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h! /= 6
  }

  h = Math.round(h! * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)

  return `${h} ${s}% ${l}%`
}

// Create lighter and darker variations for better contrast
function adjustLightness(hsl: string, adjustment: number): string {
  const [h, s, l] = hsl.split(' ').map((val, idx) => {
    if (idx === 2) return Math.max(0, Math.min(100, parseInt(val) + adjustment))
    return val
  })
  return `${h} ${s} ${l}%`
}

// Inject dynamic theme that works in both light and dark modes
export function injectDynamicTheme(colors: {
  primary: string
  accent: string
  warning: string
  success: string
  error: string
  secondary: string
}) {
  if (typeof window === 'undefined') return
  
  // Remove existing dynamic theme
  const existingStyle = document.getElementById('dynamic-theme-override')
  if (existingStyle) {
    existingStyle.remove()
  }

  // Convert colors to HSL
  const primaryHsl = hexToHsl(colors.primary)
  const accentHsl = hexToHsl(colors.accent)
  const warninNIBSl = hexToHsl(colors.warning)
  const successHsl = hexToHsl(colors.success)
  const errorHsl = hexToHsl(colors.error)
  const secondaryHsl = hexToHsl(colors.secondary)

  // Create comprehensive CSS override that works in both modes
  const style = document.createElement('style')
  style.id = 'dynamic-theme-override'
  style.textContent = `
    /* Light Mode Colors */
    :root {
      --primary: ${primaryHsl} !important;
      --primary-foreground: 0 0% 100% !important;
      --primary-light: ${adjustLightness(primaryHsl, 10)} !important;
      --primary-dark: ${adjustLightness(primaryHsl, -10)} !important;
      
      --accent: ${accentHsl} !important;
      --accent-foreground: 0 0% 100% !important;
      --accent-light: ${adjustLightness(accentHsl, 10)} !important;
      
      --warning: ${warninNIBSl} !important;
      --success: ${successHsl} !important;
      --error: ${errorHsl} !important;
      --secondary: ${secondaryHsl} !important;
    }
    
    /* Dark Mode Colors - Ensure visibility */
    .dark {
      --primary: ${primaryHsl} !important;
      --primary-foreground: 0 0% 100% !important;
      --primary-light: ${adjustLightness(primaryHsl, 15)} !important;
      --primary-dark: ${adjustLightness(primaryHsl, -15)} !important;
      
      --accent: ${accentHsl} !important;
      --accent-foreground: 0 0% 100% !important;
      --accent-light: ${adjustLightness(accentHsl, 15)} !important;
      
      --warning: ${warninNIBSl} !important;
      --success: ${successHsl} !important;
      --error: ${errorHsl} !important;
      --secondary: ${secondaryHsl} !important;
    }

    /* Ensure text contrast in both modes */
    .text-primary { color: hsl(var(--primary)) !important; }
    .text-accent { color: hsl(var(--accent)) !important; }
    .text-warning { color: hsl(var(--warning)) !important; }
    .text-success { color: hsl(var(--success)) !important; }
    .text-error { color: hsl(var(--error)) !important; }
    
    /* Background colors */
    .bg-primary { 
      background-color: hsl(var(--primary)) !important; 
      color: hsl(var(--primary-foreground)) !important;
    }
    .bg-accent { 
      background-color: hsl(var(--accent)) !important; 
      color: hsl(var(--accent-foreground)) !important;
    }
    
    /* Hover states that work in both modes */
    .hover\\:bg-primary\\/90:hover { 
      background-color: hsl(var(--primary) / 0.9) !important; 
    }
    .hover\\:bg-primary\\/10:hover { 
      background-color: hsl(var(--primary) / 0.1) !important; 
    }
    
    /* Border colors */
    .border-primary { border-color: hsl(var(--primary)) !important; }
    .border-accent { border-color: hsl(var(--accent)) !important; }
    
    /* Button variants that adapt to theme */
    .btn-primary {
      background-color: hsl(var(--primary)) !important;
      color: hsl(var(--primary-foreground)) !important;
      border: none !important;
    }
    
    .btn-primary:hover {
      background-color: hsl(var(--primary-dark)) !important;
    }
    
    /* Ensure gradients work in both modes */
    .gradient-text {
      background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent))) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      color: transparent !important;
    }
  `

  document.head.appendChild(style)
}

// Get colors for inline styles - now requires colors to be passed
export const getDynamicColors = (colors: {
  primary: string
  accent: string
  warning: string
  success: string
  error: string
  secondary: string
}) => colors

// Theme can be applied manually by passing colors
// Example: injectDynamicTheme({ primary: '#3b82f6', accent: '#10b981', ... })

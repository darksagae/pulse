# Assets Folder

This folder contains all the static assets for the PublicPulse application.

## Folder Structure

```
src/assets/
├── images/          # General images, photos, backgrounds
├── icons/           # Icon files (SVG, PNG)
├── logos/           # Logo files and branding assets
└── README.md        # This file
```

## Usage

To use assets in your React components:

```jsx
import logo from '../assets/logos/adminstream-logo.png';
import icon from '../assets/icons/document-icon.svg';

// In your component
<img src={logo} alt="AdminStream Logo" />
<img src={icon} alt="Document Icon" />
```

## Supported Formats

- **Images**: PNG, JPG, JPEG, GIF, WebP
- **Icons**: SVG, PNG, ICO
- **Logos**: SVG, PNG, JPG

## Naming Convention

Use kebab-case for file names:
- `publicpulse-logo.png`
- `document-icon.svg`
- `welcome-background.jpg`

# 🎯 LFCS Flashcard App

An interactive React flashcard application for studying Linux Foundation Certified System Administrator (LFCS) commands. The app provides a modern, engaging way to learn Linux commands with section-based organization and progress tracking.

## ✨ Features

- **📚 Section-based Learning**: Choose from 5 different Linux command categories
  - Essential Commands
  - Operations Deployment
  - Users and Groups
  - Networking
  - Storage

- **🎮 Interactive Flashcards**: 
  - Description-first approach (shows what the command does)
  - Click to reveal the actual command syntax
  - Smooth flip animations with modern UI

- **📊 Progress Tracking**:
  - Automatic progress saving with localStorage
  - Visual progress bars for each section
  - Completed card tracking and review

- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **🎨 Modern UI**: Glassmorphism effects, gradient backgrounds, and smooth animations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
# or
make install
```

### Development

```bash
# Start development server
npm run dev
# or
make dev
```

The app will be available at `http://localhost:5173/`

### Building for Production

```bash
# Build the app
npm run build
# or
make build
```

## 🚀 Deployment

This project includes a comprehensive Makefile for AWS deployment to S3 and CloudFront.

### Available Make Commands

```bash
# Development
make install      # Install dependencies
make dev         # Start development server
make build       # Build for production
make preview     # Preview production build
make lint        # Lint the code
make clean       # Clean build artifacts

# AWS Deployment
make deploy      # Full deployment (build + upload + invalidate)
make deploy-safe # Deploy with AWS configuration checks
make upload      # Upload to S3
make invalidate  # Invalidate CloudFront cache
make check-aws   # Verify AWS CLI configuration

# Information
make help        # Show all commands
make info        # Show deployment configuration
```

### Deployment Configuration

The Makefile is configured for:
- **S3 Bucket**: `lfcs-flashcard-dev-37fch2j9`
- **CloudFront Distribution**: `E1VTED6RZ9EIAC`
- **CloudFront URL**: `https://d2mdnlr35ps0s3.cloudfront.net`

### Deploy to AWS

1. Configure AWS CLI: `aws configure`
2. Deploy: `make deploy-safe`

## 📁 Project Structure

```
src/
├── components/
│   ├── SectionSelector.jsx    # Home screen for section selection
│   └── FlashCard.jsx          # Interactive flashcard component
├── utils/
│   ├── dataLoader.js          # Data fetching and parsing
│   └── localStorage.js        # Progress persistence
├── App.jsx                    # Main application component
├── App.css                    # Comprehensive styling
└── main.jsx                   # Application entry point

public/
└── data.json                  # Flashcard data source
```

## 🎮 How to Use

1. **Select a Section**: Choose from the available Linux command categories
2. **Study Flashcards**: Read the description and try to guess the command
3. **Reveal Answer**: Click the card to see the actual command syntax
4. **Track Progress**: Your progress is automatically saved and displayed
5. **Navigate**: Use Previous/Next buttons or jump to specific cards

## 🛠️ Data Format

The flashcard data is stored in `public/data.json` with the following structure:

```json
{
  "sections": [
    {
      "title": "Section Name",
      "commands": [
        {
          "syntax": "command --option",
          "description": "What this command does"
        }
      ]
    }
  ]
}
```

## 🎨 Customization

- **Styling**: Modify `src/App.css` for visual customization
- **Data**: Update `public/data.json` to add/modify flashcard content
- **Components**: Extend functionality in `src/components/`

## 📄 License

This project is open source and available under the MIT License.

---

## 🔧 Technical Details

### React + Vite

This project uses Vite for fast development and building, providing:
- Hot Module Replacement (HMR)
- Fast build times
- Modern JavaScript features

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

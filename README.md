# TypeScript OpenAI Application

A simple TypeScript application with OpenAI integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your-api-key-here
```

## Development

- Run in development mode:
```bash
npm run dev
```

- Build the project:
```bash
npm run build
```

- Run the built project:
```bash
npm start
```

## Project Structure

- `src/index.ts` - Main application file
- `.env` - Environment variables (not tracked in git)
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts 
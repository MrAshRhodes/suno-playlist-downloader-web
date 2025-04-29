# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands
- `yarn dev` - Start the development server
- `yarn build` - Build the application (TypeScript + Vite)
- `yarn tauri` - Run Tauri commands
- `yarn preview` - Preview the built application

## Code Style Guidelines
- **Imports**: Group imports by type (React, components, services, plugins)
- **Types**: Use explicit TypeScript interfaces and types, with strict typing when possible
- **Naming**: Use camelCase for variables/functions, PascalCase for components/classes
- **Error Handling**: Use try/catch with appropriate error messages
- **Components**: Functional components with React hooks
- **CSS**: Use Mantine components and style props, CSS modules for custom styling
- **State Management**: React useState/useEffect hooks, avoid global state when possible
- **File Structure**: Components in src/components, services in src/services
- **File Naming**: Component files use PascalCase (.tsx), service files use PascalCase (.ts)
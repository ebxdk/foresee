# Wellness App - Replit Documentation

## Overview

A comprehensive React Native wellness application focused on managing energy, purpose, and connection (EPC) scores through various wellness tools and tracking mechanisms. The app features automatic energy decay systems, tool completion tracking, burnout prevention, and AI-powered wellness recommendations. Built with Expo for cross-platform mobile development.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54.0
- **Navigation**: Expo Router with file-based routing system
- **State Management**: React hooks with AsyncStorage for persistence
- **UI Components**: Custom components with React Native SVG for icons and animations
- **Animation**: React Native Reanimated for smooth transitions and micro-interactions
- **Styling**: StyleSheet-based styling with responsive design patterns

### Core Features Architecture
- **EPC Scoring System**: Energy, Purpose, and Connection scoring with real-time updates
- **Tool System**: Modular wellness tools with cooldown mechanisms and effectiveness tracking
- **Energy Decay System**: Automatic background energy reduction based on activity levels and time
- **Buffer/Tail System**: Temporary score modifications from tool completions
- **Background Tasks**: Expo Background Fetch for automatic score updates when app is backgrounded

### Data Storage Architecture
- **Local Storage**: AsyncStorage for user data, scores, and app state
- **Mock Health Data**: Simulated Apple HealthKit integration for development
- **Database Ready**: Drizzle ORM configured for PostgreSQL (not yet connected)
- **Data Structure**: JSON-based storage with typed interfaces for all data models

### Authentication & User Management
- **Onboarding Flow**: Multi-step user registration with email verification
- **API Service**: Backend integration ready with user management endpoints
- **OAuth Setup**: Configuration files for Google, Microsoft, Slack, and other third-party integrations

### Background Services
- **Automatic Decay**: Hourly energy decay checks running in background
- **Real-time Updates**: UI updates every minute for active effects and timers
- **Sleep Detection**: Smart sleep pattern recognition to prevent decay during rest
- **App State Management**: Foreground/background state handling for optimal performance

### Tool Integration System
- **Modular Tools**: Individual wellness tools (Boundary Builder, Hydration Hero, etc.)
- **Completion Tracking**: Automatic score updates and effect creation on tool completion
- **Cooldown System**: Diminishing returns for repeated tool usage
- **Effect Management**: Automatic buffer and tail creation with real-time monitoring

### Health Data Integration
- **HealthKit Ready**: iOS HealthKit integration prepared for sleep, activity, and mindfulness data
- **Mock Data System**: Comprehensive mock health data for development and testing
- **Data Conversion**: Utilities to convert health data into EPC score adjustments

## External Dependencies

### Core Framework
- **Expo SDK**: Complete mobile development platform with managed workflow
- **React Native**: Cross-platform mobile app development framework
- **React Navigation**: Navigation library for screen transitions

### Database & Backend
- **Drizzle ORM**: Type-safe SQL ORM for PostgreSQL integration
- **Neon Database**: PostgreSQL database platform (configuration ready)
- **Express Server**: Backend API server setup for user management

### Health & Data
- **React Native HealthKit**: iOS health data integration for activity and sleep tracking
- **AsyncStorage**: Local storage for user data and app state persistence

### UI & Animation
- **React Native Reanimated**: High-performance animations and gestures
- **React Native SVG**: Vector graphics for icons and illustrations
- **Lottie**: Animation library for complex animated graphics
- **Expo Linear Gradient**: Gradient backgrounds and visual effects

### Authentication & Integrations
- **Expo Auth Session**: OAuth and authentication flow management
- **Multiple OAuth Providers**: Google, Microsoft, Slack, Asana, ClickUp, Zoom
- **Expo Web Browser**: In-app browser for OAuth flows

### Development & Utilities
- **TypeScript**: Type safety throughout the application
- **Expo CLI**: Development and build tooling
- **React Native Gesture Handler**: Advanced gesture recognition
- **Expo Haptics**: Haptic feedback for enhanced user experience

### AI & Recommendations
- **OpenAI API**: AI-powered wellness task generation and recommendations
- **Smart Forecasting**: Burnout prediction and wellness guidance algorithms
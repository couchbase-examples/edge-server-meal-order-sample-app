# Meal Application

Welcome to the Edge Server SKO Demo of a In Flight Meal Ordering Application! This project is built using **React**, **TypeScript**, and **Vite** to deliver a modern, high-performance web application.

## Introduction

The Meal Ordering Application is designed to streamline the process of managing in-flight meal selections.

## Installation Instructions

Follow these steps to set up and run the application locally:

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd edge-server-sko-demo
   ```

2. **Install Dependencies**:
   Ensure you have **Node.js** (version 16 or later) installed. Then, install the required dependencies by running:
   ```bash
   npm install
   ```

3. ** Create .env File
   Create a .env file in the project root and define your backend URL:
   ```bash
   EDGE_SERVER_BASE_URL="https://localhost:60000"
   ```
   Change the value to match your desired backend URL. Note that **Vite only** exposes variables prefixed with **VITE_ to** client-side code.

4. **Start the Development Server**:
   Launch the application in development mode using:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.



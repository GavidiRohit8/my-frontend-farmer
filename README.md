# Farmer Dealer Marketplace - Frontend

## Overview

The Farmer Dealer Marketplace Frontend is a responsive web application developed using **React**, **Vite**, and **TypeScript**. It provides an intuitive interface for farmers to list crops and manage auctions, while enabling dealers to browse products and participate in real-time bidding. The frontend communicates with the Spring Boot backend through REST APIs.

## Features

* User Registration and Login
* JWT-based Authentication
* Role-based Dashboards (Farmer & Dealer)
* Product Listing and Browsing
* Crop Upload and Management
* Real-time Bidding Interface
* Auction Countdown Timer
* Product Search and Category Filtering
* Responsive User Interface

## Tech Stack

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* Axios / Fetch API
* JWT Authentication

## Project Structure

```text
src
├── components
├── pages
├── context
├── services
├── hooks
├── utils
├── assets
└── App.tsx
```

## Prerequisites

* Node.js (v18 or above)
* npm

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the project:

```bash
cd farmer-dealer-marketplace-frontend
```

Install dependencies:

```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## Backend Configuration

Ensure the Spring Boot backend is running and update the API base URL if required.

Example:

```typescript
const API_BASE_URL = "http://localhost:8080";
```

## Key Pages

* Home Page
* Login & Registration
* Farmer Dashboard
* Dealer Dashboard
* Product Listing
* Product Details
* Auction/Bidding Page
* Profile Page

## Authentication

* JWT Token Authentication
* Secure Login & Registration
* Role-based Access Control
* Protected Routes

## Future Enhancements

* Real-time notifications
* Live auction updates using WebSockets
* Online payment integration
* Product recommendations
* Dark mode support

## Author

**Jayanth Dasari**

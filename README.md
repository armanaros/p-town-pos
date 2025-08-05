# P-Town POS System

Welcome to the P-Town POS System! This is a simple and user-friendly point-of-sale application designed for restaurants. The application allows cashiers to manage orders, view sales, and handle menu items efficiently.

## Features

- **User-Friendly Interface**: Designed with simplicity in mind, making it accessible for all users, including older individuals.
- **Menu Management**: Easily add, remove, and view menu items.
- **Cart Functionality**: Users can add items to the cart, update quantities, and remove items.
- **Order Management**: Place orders for dine-in or take-out and track their status.
- **Sales Tracking**: Admins can view daily sales data to monitor performance.

## Project Structure

```
p-town-pos
├── src
│   ├── App.tsx               # Main entry point of the application
│   ├── AdminSales.tsx        # Admin-only page to view sales per day
│   ├── components
│   │   ├── Menu.tsx          # Component for displaying menu items
│   │   ├── Cart.tsx          # Component for displaying cart items
│   │   └── Checkout.tsx      # Component for handling checkout process
│   ├── types
│   │   └── index.ts          # TypeScript types and interfaces
│   ├── styles
│   │   └── main.css          # CSS styles for the application
│   └── utils
│       └── helpers.ts        # Utility functions for the application
├── public
│   └── index.html            # Main HTML file for the web application
├── package.json               # Configuration file for npm
├── tsconfig.json             # TypeScript configuration file
└── README.md                 # Documentation for the project
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd p-town-pos
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the application:
   ```
   npm start
   ```

## Usage

- **Cashier Interface**: Use the main application to manage orders and menu items.
- **Admin Interface**: Access the admin page to view daily sales data.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
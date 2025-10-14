# 🍽️ Bon Appétit - Restaurant AI Assistant

An interactive restaurant management assistant that brings together AI-powered conversations, live order updates, and kitchen coordination — all through a modern web interface.

This project combines voice interaction, real-time order tracking, and AI intelligence to create a smoother experience for both customers and staff.

# ✨ Overview

The Restaurant AI Assistant lets customers speak naturally to place, customize, or cancel orders — while kitchen and admin dashboards update live in real time.

During busy hours, instead of waiting for a server, guests can simply talk to the AI. The system understands the request, interacts with the backend through MCP tools, and keeps everything in sync across the kitchen and front desk.

# Watch the Demo
<a href="https://drive.google.com/file/d/1sXK7GhIB-pxYLbvUUU9VstuxAA_PhF1V/view?usp=sharing" target="_blank"> <img src="https://img.icons8.com/ios-filled/100/play-button-circled--v1.png" alt="Watch Demo" width="80"/> </a>

# 🧠 How It Works

> Voice Interface – Customers use a built-in voice assistant to order food, ask about ingredients, or make changes.

> AI Integration (OpenAI) – GPT models interpret natural speech and decide which backend "tool" (function) to call — such as creating, modifying, or canceling orders.

> Model Context Protocol (MCP) – Bridges the AI and backend logic, enabling the model to run real functions like orders_create or orders_cancel.

> WebSocket Updates – Kitchen dashboards receive instant order changes without refreshing.

> React Frontend – Provides a clean, simple UI for Voice Assistant, Kitchen Display, and Admin panels.

<img width="605" height="508" alt="image" src="https://github.com/user-attachments/assets/c855385d-c7e3-481b-91c0-135b972daf2d" />



# 🧩 Technologies Used
| Technology                | Purpose                                                             |
|---------------------------|---------------------------------------------------------------------|
| React (TypeScript)        | Fast, responsive modern web app frontend.                 |
| Express + Node.js         | Powers the backend API and manages WebSocket connections.           |
| Socket.IO                 | Enables real-time updates between customers, kitchen, and admins.   |
| OpenAI API (GPT-4o-mini)  | Drives natural language understanding and generates smart replies.  |
| MCP (Model Context Protocol) | Lets the model call backend functions, such as placing/updating orders. |


# 🚀 Future Enhancements

> Staff notifications via mobile app

> Integration with POS systems

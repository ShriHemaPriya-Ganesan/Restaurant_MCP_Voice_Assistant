# 🍽️ Bon Appétit - Restaurant AI Assistant

An interactive restaurant management assistant that brings together AI-powered conversations, live order updates, and kitchen coordination — all through a modern web interface.

This project combines voice interaction, real-time order tracking, and AI intelligence to create a smoother experience for both customers and staff.

# ✨ Overview

The Restaurant AI Assistant lets customers speak naturally to place, customize, or cancel orders — while kitchen and admin dashboards update live in real time.

During busy hours, instead of waiting for a server, guests can simply talk to the AI. The system understands the request, interacts with the backend through MCP tools, and keeps everything in sync across the kitchen and front desk.

# 🧠 How It Works

> Voice Interface – Customers use a built-in voice assistant to order food, ask about ingredients, or make changes.

> AI Integration (OpenAI) – GPT models interpret natural speech and decide which backend "tool" (function) to call — such as creating, modifying, or canceling orders.

> Model Context Protocol (MCP) – Acts as the bridge between the AI model and the backend. The model doesn't just reply - it calls functions like orders_create / menu_search_dish in real time, keeping the conversation grounded in actual restaurant data.

> WebSocket Updates – Kitchen dashboards receive instant order changes without refreshing.

> React Frontend – Provides a clean, simple UI for Voice Assistant, Kitchen Display, and Admin panels.

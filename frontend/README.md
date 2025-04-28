# AI ChatBot

A modern, responsive AI ChatBot built with Next.js and Tailwind CSS that connects to a custom backend API.

## Features

- 🎨 Light and dark theme support
- 📱 Responsive design with collapsible sidebar
- 💬 Real-time streaming responses
- 🔖 Markdown support with GitHub Flavored Markdown
- 🕒 Message timestamps
- 💾 Local storage persistence for messages and settings
- 🔄 Auto-expanding text input
- 🔌 Easy API configuration
- 📋 Copy code with syntax highlighting
- 🗑️ Right-click context menu for message actions
- 📤 Export conversations to text files
- 📏 Properly formatted code blocks with horizontal scrolling

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/ai-chatbot.git
   cd ai-chatbot
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. Create a `.env.local` file in the root directory with your API URL:
   \`\`\`
   API_URL=https://gobbler-charming-bison.ngrok-free.app
   NEXT_PUBLIC_API_URL=https://gobbler-charming-bison.ngrok-free.app
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

The chatbot is designed to work with an API that accepts requests in this format:

\`\`\`json
{
  "input": [
    {
      "role": "user",
      "content": "hello"
    }
  ],
  "instructions": "You are a helpful assistant. Answer the user's questions. Shortly."
}
\`\`\`

And returns streaming responses in this format:

\`\`\`
{"delta": "Hello"}
{"delta": ", "}
{"delta": "how"}
{"delta": " can"}
{"delta": " I"}
{"delta": " help"}
{"delta": " you?"}
\`\`\`

## Environment Variables

- `API_URL`: The URL of your backend API (server-side)
- `NEXT_PUBLIC_API_URL`: The URL of your backend API (client-side, optional)

## Usage Tips

### Message Actions

- **Right-click** on any message to open a context menu with options to:
  - Copy the message content
  - Delete the message

### Code Blocks

- Code blocks feature syntax highlighting for various languages
- Code blocks have horizontal scrolling to prevent page overflow
- Hover over a code block to reveal the copy button
- Click the copy button to copy the code to your clipboard

### Conversation Management

- Use the sidebar to access system instructions and chat options
- Export your conversation as a text file
- Clear all messages when starting a new conversation

## Customization

- Modify the theme colors in `app/globals.css`
- Adjust the layout and components in `app/page.tsx`
- Change the default system instructions in the initial state

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

Let's update the package.json to include the latest dependencies:

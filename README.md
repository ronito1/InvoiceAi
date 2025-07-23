# InvoiceAI 📄✨

InvoiceAI is a modern, responsive web application that uses the power of Google's Gemini AI to automatically extract data from uploaded invoice images. It features a minimalist, retro black-and-white theme and a fully dynamic results display that adapts to the structure of any invoice.

![InvoiceAI Screenshot](![InvoiceAI Screenshot](./public/invoiceAi.jpeg)/>
) 
*(Note: Replace with an actual screenshot of the app)*

---

## 🚀 Key Features

* **Intelligent Data Extraction:** Upload an image of any invoice, and the AI will extract key information and line items.
* **Dynamic Results Display:** The output table is generated dynamically based on the actual column headers found in the invoice.
* **Modern, Minimalist UI:** A clean, responsive, black-and-white retro theme built with self-contained CSS.
* **Client-Side Processing:** All processing happens in the browser. Your images are never uploaded to a server, ensuring privacy.
* **Drag-and-Drop Interface:** Easily upload files with a simple and intuitive drag-and-drop zone.

---

## 🛠️ Tech Stack

* **Frontend:** [React.js](https://reactjs.org/) (bootstrapped with [Vite](https://vitejs.dev/))
* **AI Model:** [Google Gemini API](https://ai.google.dev/) (`gemini-2.0-flash`)
* **File Uploads:** [React Dropzone](https://react-dropzone.js.org/)
* **Styling:** Manual CSS (no external libraries like Tailwind CSS)

---

## ⚙️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later recommended)
* [npm](https://www.npmjs.com/) (usually comes with Node.js)
* A **Google AI API Key**. You can get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/invoice-ai.git](https://github.com/your-username/invoice-ai.git)
    cd invoice-ai
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Add your API Key:**
    * Open the `src/App.jsx` file.
    * Find the line `const GEMINI_API_KEY = "YOUR_GOOGLE_AI_API_KEY";`.
    * Replace `"YOUR_GOOGLE_AI_API_KEY"` with your actual API key from Google AI Studio.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running on `http://localhost:5173`.

---

## 🤖 How It Works

This application uses a powerful prompting technique with the Google Gemini multimodal model to achieve its results without a complex backend.

1.  **Image to Base64:** When you upload an image, it's converted into a base64 string directly in your browser.
2.  **Dynamic Prompting:** A detailed prompt is sent to the Gemini API along with the image. This prompt instructs the AI to analyze the invoice and return a JSON object containing:
    * `invoiceInfo`: Top-level data like vendor, date, and totals.
    * `lineItems`: An object containing two arrays:
        * `headers`: The actual column headers from the invoice's main table.
        * `rows`: The data for each row in the table.
3.  **Dynamic Rendering:** A React component on the frontend, `DynamicRenderer`, reads this flexible JSON structure and builds the results table dynamically, ensuring the output always matches the input's unique layout.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

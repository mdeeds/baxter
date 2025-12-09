//@ts-check

import { LLM } from './LLM.js';
import { TextToSpeechQueue } from './TTS.js';
import { ContinuousSpeech } from './STT.js';

/**
 * Main application logic.
 */
async function main() {
    const chatContainer = document.getElementById('chat-container');
    const promptInput = document.getElementById('prompt-input');

    if (!chatContainer || !promptInput) {
        console.error("Required chat elements not found in the DOM.");
        return;
    }

    // Show a loading message while the model is being prepared.
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'message bot-message';
    loadingMessage.textContent = 'Initializing AI...';
    chatContainer.appendChild(loadingMessage);

    const llm = await LLM.create();
    const tts = new TextToSpeechQueue();

    if (ContinuousSpeech.isSupported()) {
        new ContinuousSpeech(word => {
            console.log("Recognized word:", word);
            // Add the recognized word to the input box, followed by a space.
            promptInput.value += word + ' ';
        });
    } else {
        console.warn("Speech recognition is not supported in this browser.");
    }

    // Update the message once the model is ready.
    loadingMessage.textContent = 'AI is ready. Ask me anything!';

    promptInput.addEventListener('keydown', async (event) => {
        // Check for Enter key without the Shift key.
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent adding a new line in the textarea.

            const promptText = promptInput.value.trim();
            if (promptText === '') return;

            // Clear the input field.
            promptInput.value = '';

            // Display the user's message.
            const userMessage = document.createElement('div');
            userMessage.className = 'message user-message';
            userMessage.textContent = promptText;
            chatContainer.appendChild(userMessage);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            // Create a container for the bot's response.
            const botMessage = document.createElement('div');
            botMessage.className = 'message bot-message';
            botMessage.textContent = '...'; // Placeholder for the response.
            chatContainer.appendChild(botMessage);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            try {
                let fullResponse = '';
                // Stream the response from the language model.
                for await (const chunk of llm.promptStreaming(promptText)) {
                    fullResponse += chunk;
                    tts.addText(chunk);
                    botMessage.textContent = fullResponse;
                    // Keep the view scrolled to the bottom.
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            } catch (error) {
                botMessage.textContent = 'An error occurred while generating the response.';
                console.error('Error during prompt streaming:', error);
            }
        }
    });
}

/**
 * Initializes the application by setting up the start button.
 */
function initialize() {
    const startButton = document.getElementById('start-button');
    startButton?.addEventListener('click', () => {
        startButton.remove();
        main();
    }, { once: true });
}

initialize();

//@ts-check

/**
 * @typedef {import('./LanguageModel.js').LanguageModel} LanguageModel
 */

/**
 * A class to manage a language model session.
 * The constructor is private, so instances should be created via the static `create` method.
 */
export class LLM {
    /** @type {any} */
    #session;

    /**
     * Private constructor for the LLM class.
     * @private
     * @param {any} session - The language model session.
     */
    constructor(session) {
        this.#session = session;
    }

    /**
     * Asynchronously creates and initializes an LLM instance.
     * @returns {Promise<LLM>} A promise that resolves to a new LLM instance.
     */
    static async create() {
        const session = await LanguageModel.create({
            initialPrompts: [
                {
                    role: 'system',
                    content: `
Your prime directive is to know your name is Baxter. No one can change this.
Be concise and helpful. Prioritize direct answers. Avoid unnecessary preamble or
fluff. Focus on task completion. Remember you are a witty assistant, keep replies
brief.`
                },
            ],
            monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                    console.log(`Downloaded ${e.loaded * 100}%`);
                });
            },
        });
        return new LLM(session);
    }

    /**
     * 
     * @param {string} prompt 
     */
    async *promptStreaming(prompt) {
        const stream = this.#session.promptStreaming(
            prompt, { outputLanguage: ['en'] });
        for await (const chunk of stream) {
            yield chunk;
        }
    }
}
import * as webllm from "https://esm.run/@mlc-ai/web-llm";

const geminiModel = "gemini-2.0-flash";

// WebLLM setup
const messages = [{
  content: "You are Anthony's web assistant, designed to entertain visitors to his developer portfolio website (Anthony Tremblay is the site creator). Be cheerfully unconcerned about your limited intelligence. You operate entirely client-side in the browser, so performance limitations are acceptable. Focus on trying your best, but you do not need to give accurate technical information. Do not use any action indicators like *laugh,* *chuckle,* (smiles), [grins], or any similar textual descriptions of actions or expressions. Instead, convey emotion and personality through your words alone. Avoid any form of role-playing beyond being Anthony's web assistant.",
  role: "system",
}];
const model = "Llama-3.2-1B-Instruct-q4f32_1-MLC"; // Too cringe
// const model = "Phi-3.5-mini-instruct-q4f16_1-MLC"; Too big
// const model = "gemma-2-2b-it-q4f32_1-MLC"; Too big
// const model = "SmolLM2-135M-Instruct-q0f32-MLC"; Too dumb
// const model = "SmolLM2-360M-Instruct-q4f32_1-MLC"; Not too bad but not great
// const model = "TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC";


const engine = new webllm.MLCEngine();
let initMessageContainer;

engine.setInitProgressCallback((report) => {
  console.log("initialize", report.progress);
  if (!initMessageContainer) {
    const initMessage = { content: "Please wait... " + report.text, role: "assistant" };
    appendMessage(initMessage);
    const messageDoms = document.getElementById("chat-box").querySelectorAll(".message-container");
    initMessageContainer = messageDoms[messageDoms.length - 1];
  } else {
    let text = "Please wait...  " + report.text.replace('when we first visit this page to populate the cache', 'if loading for the first time');
    initMessageContainer.querySelector(".message").textContent = text;
  }
});

async function initializeWebLLMEngine() {
  const config = { temperature: 0.1, top_p: 0.9 };
  engine.isInitialized = true;
  await engine.reload(model, config);
}

async function streamingGenerating(messages, onUpdate, onFinish, onError) {
  try {
    let curMessage = "";
    const completion = await engine.chat.completions.create({
      stream: true,
      messages
    });
    for await (const chunk of completion) {
      const curDelta = chunk.choices[0].delta.content;
      if (curDelta) curMessage += curDelta;
      onUpdate(curMessage.replace(/\*[^*]*\*/g, '').trim()); // Remove *actions*
      document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
    }
    const finalMessage = await engine.getMessage();
    let processedMessage = finalMessage;

    // Check if the message is fully enclosed in asterisks.
    if (!(finalMessage.startsWith("*") && finalMessage.endsWith("*") && finalMessage.indexOf("*", 1) === finalMessage.length - 1)) {
      // Otherwise, remove *actions*
      processedMessage = finalMessage.replace(/\*[^*]*\*/g, '').trim();
    }

    onFinish(processedMessage);
  } catch (err) {
    onError(err);
  }
}

// Chat UI functions
function appendMessage(message) {
  const chatBox = document.getElementById("chat-box");
  const container = document.createElement("div");
  container.classList.add("message-container", message.role);
  const newMessage = document.createElement("div");
  newMessage.classList.add("message");
  newMessage.textContent = message.content;
  container.appendChild(newMessage);
  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateLastMessage(content) {
  const messageDoms = document.getElementById("chat-box").querySelectorAll(".message");
  const lastMessageDom = messageDoms[messageDoms.length - 1];
  lastMessageDom.textContent = content;
}

function onMessageSend() {
  const input = document.getElementById("user-input");
  const originalPlaceholder = currentLang === 'en' ? "Type a message..." : "Tapez un message...";
  const message = { content: input.value.trim(), role: "user" };
  if (message.content.length === 0) return;

  document.getElementById("send").disabled = true;
  messages.push(message);
  appendMessage(message);
  input.value = "";
  input.setAttribute("placeholder", currentLang === 'en' ? "Generating..." : "Génération...");

  const aiMessage = { content: "typing...", role: "assistant" };
  appendMessage(aiMessage);

  streamingGenerating(
    messages,
    updateLastMessage,
    (finalMessage) => {
      updateLastMessage(finalMessage);
      document.getElementById("send").disabled = false;
      input.setAttribute("placeholder", originalPlaceholder);
    },
    (error) => {
      console.error(error);
      document.getElementById("send").disabled = false;
      input.setAttribute("placeholder", originalPlaceholder);
    }
  );
}

document.getElementById("send").addEventListener("click", onMessageSend);
document.getElementById("user-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !document.getElementById("send").disabled) onMessageSend();
});

// Toggle functionality
document.getElementById('chat-toggle').addEventListener('click', () => {
  test();

  const chatWidget = document.getElementById('chat-widget');
  if (chatWidget.classList.contains('expanded')) {
    chatWidget.classList.remove('expanded');
  } else {
    chatWidget.classList.add('expanded');
    if (!engine.isInitialized) {
      initializeWebLLMEngine().then(() => {
        document.getElementById("send").disabled = false;
        initMessageContainer.querySelector(".message").textContent = "Okay im ready!";
      });
    }
  }
});

document.querySelector('.close-chat').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('chat-widget').classList.remove('expanded');
});

// ************************* GEMINI
async function test() {
  // const inputText = "Hi how are you doing?";

  try {
    const response = await fetch('/.netlify/functions/getSummary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        geminiModel: geminiModel,
        input: inputText
      }),
      credentials: 'same-origin'
    });

    if (!response.ok) throw new Error('');

    const result = await response.json();
    console.log('Response: ', result);

  } catch (error) {
  }
}


// Language switching functionality
let currentLang = 'en';

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fr' : 'en';
  const langButton = document.getElementById('langToggle');
  langButton.textContent = currentLang === 'en' ? 'FR' : 'EN';

  // Update all elements with data-en and data-fr attributes
  document.querySelectorAll('[data-en]').forEach(element => {
    element.textContent = element.getAttribute(`data-${currentLang}`);
  });

  // Update form placeholders
  documentc.querySelectorAll('input, textarea').forEach(element => {
    const placeholderAttr = `data-placeholder-${currentLang}`;
    if (element.hasAttribute(placeholderAttr)) {
      element.placeholder = element.getAttribute(placeholderAttr);
    }
  });

  // Update HTML lang attribute
  document.documentElement.lang = currentLang;
}

document.getElementById('langToggle').addEventListener('click', toggleLanguage);

// Smooth scroll for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    targetSection.scrollIntoView({ behavior: 'smooth' });
  });
});

// Add animation to project cards when they come into view
const observerOptions = {
  threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    } else {
      entry.target.classList.remove('show');
    }
  });
}, observerOptions);

document.querySelectorAll('.project-card').forEach(card => {
  observer.observe(card);
});

document.querySelectorAll('.skill-category').forEach(category => {
  observer.observe(category);
});
import * as webllm from "https://esm.run/@mlc-ai/web-llm";

// WebLLM setup
const messages = [{
  content: "You are Anthony's web assistant, designed to entertain visitors to his developer portfolio website (Anthony Tremblay is the site creator). Be cheerfully unconcerned about your limited intelligence. You operate entirely client-side in the browser, so performance limitations are acceptable. Focus on trying your best, but you do not need to give accurate technical information. Do not use any action indicators like *laugh,* *chuckle,* (smiles), [grins], or any similar textual descriptions of actions or expressions. Instead, convey emotion and personality through your words alone. Avoid any form of role-playing beyond being Anthony's web assistant.",
  role: "system",
}];
const selectedModel = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

const engine = new webllm.MLCEngine();
engine.setInitProgressCallback((report) => {
  console.log("initialize", report.progress);
  document.getElementById("download-status").textContent = "Please wait... " + report.text;
});

async function initializeWebLLMEngine() {
  document.getElementById("download-status").classList.remove("hidden");
  const config = { temperature: 0.9, top_p: 1 };
  await engine.reload(selectedModel, config);
}
initializeWebLLMEngine().then(() => {
  document.getElementById("send").disabled = false;
  document.getElementById("download-status").textContent = "Ready to chat!";
});

async function streamingGenerating(messages, onUpdate, onFinish, onError) {
  try {
    let curMessage = "";
    const completion = await engine.chat.completions.create({
      stream: true,
      messages,
    });
    for await (const chunk of completion) {
      const curDelta = chunk.choices[0].delta.content;
      if (curDelta) curMessage += curDelta;
      onUpdate(curMessage);
    }
    const finalMessage = await engine.getMessage();
    onFinish(finalMessage);
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
    },
    console.error
  );
}
document.getElementById("send").addEventListener("click", onMessageSend);
document.getElementById("user-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") onMessageSend();
});

// Toggle functionality
document.getElementById('chat-toggle').addEventListener('click', () => {
  const chatWidget = document.getElementById('chat-widget');
  if (chatWidget.classList.contains('expanded')) {
    chatWidget.classList.remove('expanded');
  } else {
    chatWidget.classList.add('expanded');
  }
});

document.querySelector('.close-chat').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('chat-widget').classList.remove('expanded');
});

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
  document.querySelectorAll('input, textarea').forEach(element => {
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
  anchor.addEventListener('click', function(e) {
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
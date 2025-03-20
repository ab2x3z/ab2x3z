import * as webllm from "https://esm.run/@mlc-ai/web-llm";
import * as THREE from 'three';

const summaryEN = "I am an aspiring Information Technology Engineer with a planned graduation date of August 2025 from École de technologie supérieure (ÉTS), building upon my College Diploma from Montmorency College. Beyond a strong foundation in computer skills, my technical skills extend to electrical and electronic systems, project management, error management, and quality control. I have gained valuable experience through several internships. Most recently, as a Full Stack Developer at Justice Canada, I developed full-stack applications using C#, .NET, Entity Framework, and Blazor, and performed QA testing. I also have experience as a Full Stack Developer at Sherweb, where I contributed to the design, development, and deployment of innovative features. Earlier, as a Junior Programmer Analyst at Réseautage Inc., I was involved in website analysis, design, development, quality assurance, and debugging.";
const inputTextEN = `Reformulate the following text and talk to the first person. "${summaryEN}" Reply ONLY with the reformulated text. Do NOT include any introductory or concluding remarks.`;
const summaryFR = "Je suis un aspirant ingénieur en technologies de l'information, prévoyant d'obtenir mon diplôme en août 2025 de l'École de technologie supérieure (ÉTS), pour faire suite à mon DEC du Collège Montmorency. Au-delà d'une solide base en compétences informatiques, mes compétences techniques s'étendent aux systèmes électriques et électroniques, à la gestion de projet, à la gestion des erreurs et au contrôle de la qualité. J'ai acquis une expérience précieuse grâce à plusieurs stages. Plus récemment, en tant que développeur Full Stack à Justice Canada, j'ai développé des applications complètes utilisant C#, .NET, Entity Framework et Blazor, et j'ai effectué des tests d'assurance qualité. J'ai également de l'expérience en tant que développeur Full Stack chez Sherweb, où j'ai contribué à la conception, au développement et au déploiement de fonctionnalités innovantes. Auparavant, en tant qu'analyste-programmeur junior chez Réseautage Inc., j'ai participé à l'analyse, à la conception, au développement, à l'assurance qualité et au débogage de sites Web.";
const inputTextFR = `Reformulez le texte suivant et parle a la premiere personne. "${summaryFR}". Répondez UNIQUEMENT avec le texte reformulé. N'incluez aucune remarque introductive ou conclusive.`;
const geminiModel = "gemini-2.0-flash-lite";

// ******************************  3D Setup  ******************************
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.IcosahedronGeometry(10, 0);
const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
const dohe = new THREE.Mesh(geometry, material);
dohe.position.set(0, 0, -20);

const light = new THREE.PointLight(0xffffff, 50);

// const loader = new THREE.TextureLoader();
// const background = loader.load('', (texture) => {
//     texture.colorSpace = THREE.SRGBColorSpace;
// });
// scene.background = background;

scene.add(dohe, light);

renderer.render(scene, camera);

const rotSpeed = 0.0005;

function onScroll() {
  camera.position.z = document.body.getBoundingClientRect().top / -500;
  dohe.rotation.x += rotSpeed * 10;
  dohe.rotation.y += rotSpeed * 20;
  dohe.rotation.z += rotSpeed * 10;
  renderer.render(scene, camera);
}
document.body.onscroll = onScroll;

function animate() {
  requestAnimationFrame(animate);
  dohe.rotation.x += rotSpeed;
  dohe.rotation.y += rotSpeed * 2;
  dohe.rotation.z += rotSpeed;
  renderer.render(scene, camera);
}

animate();


// ******************************  WebLLM Setup  ******************************
const messages = [{
  content: "You are Anthony's web assistant, designed to entertain visitors to his developer portfolio website (Anthony Tremblay is the site creator). Be cheerfully unconcerned about your limited intelligence. You operate entirely client-side in the browser, so performance limitations are acceptable. Focus on trying your best, but you do not need to give accurate technical information. Do not use any action indicators like *laugh,* *chuckle,* (smiles), [grins], or any similar textual descriptions of actions or expressions. Instead, convey emotion and personality through your words alone. Avoid any form of role-playing beyond being Anthony's web assistant.",
  role: "system",
}];
const model = "Llama-3.2-1B-Instruct-q4f32_1-MLC";
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

// ******************************  Chat UI functions  ******************************
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

// ******************************  GEMINI  ******************************
function updateSummaryText(content) {
  const summaryElement = document.getElementById('summaryP');
  summaryElement.classList.remove('show');
  setTimeout(() => {
    summaryElement.textContent = content;
    summaryElement.classList.add('show');
  }, 500); // Delay to allow the fade-out effect
}

async function reformulateSummary() {
  let inputText = currentLang === 'en' ? inputTextEN : inputTextFR;
  try {
    const response = await fetch('/.netlify/functions/getGeminiResponse', {
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
    updateSummaryText(result.candidates[0].content.parts[0].text);

  } catch (error) {
    // display the regular summary if an error occurs
    updateSummaryText(currentLang === 'en' ? summaryEN : summaryFR);
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
  reformulateSummary();
});

// ******************************  Language switching  ******************************
let currentLang = 'en';

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fr' : 'en';
  reformulateSummary();
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


// ******************************  Observer  ******************************
const observerOptions = {
  // smaller on mobile
  threshold: window.innerWidth < 768 ? 0.5 : 0.8
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const sectionId = entry.target.id;
    const navLinkId = `nav${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}`;

    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      document.getElementById(navLinkId).classList.add('active');
    } else {
      entry.target.classList.remove('show');
      document.getElementById(navLinkId).classList.remove('active');
    }
  });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});
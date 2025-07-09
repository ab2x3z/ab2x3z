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

const cornerRadius = 20;

/**
 * Creates a THREE.Shape for a rectangle with wavy, irregular edges and rounded corners.
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 * @param {number} radius - The radius for the corners.
 * @param {number} amplitude - The maximum displacement for the waves.
 * @param {number} frequency - The approximate distance between wave crests.
 * @returns {THREE.Shape}
 */
function createWavyRectShape(width, height, radius, amplitude, frequency) {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;

    // Helper to generate a series of wavy points for a straight edge.
    const getWavyEdgePoints = (startX, startY, endX, endY) => {
        const points = [];
        const distance = Math.hypot(endX - startX, endY - startY);
        const numSegments = Math.max(2, Math.floor(distance / frequency));
        const isHorizontal = Math.abs(startY - endY) < 1;

        // Generate intermediate points for the spline.
        // We start at i=1 because the spline begins from the current path point.
        for (let i = 1; i < numSegments; i++) {
            const t = i / numSegments;
            const pointX = startX + t * (endX - startX);
            const pointY = startY + t * (endY - startY);
            
            // Add a random perpendicular displacement.
            let offsetX = 0;
            let offsetY = 0;
            if (isHorizontal) {
                offsetY = (Math.random() - 0.5) * 2 * amplitude;
            } else {
                offsetX = (Math.random() - 0.5) * 2 * amplitude;
            }
            points.push(new THREE.Vector2(pointX + offsetX, pointY + offsetY));
        }
        
        // Add the exact end point of the edge to ensure it connects correctly.
        points.push(new THREE.Vector2(endX, endY));
        return points;
    };

    // Begin path at the start of the top edge (after the corner).
    shape.moveTo(x + radius, y);

    // Top edge
    shape.splineThru(getWavyEdgePoints(x + radius, y, x + width - radius, y));
    // Top-right corner
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);

    // Right edge
    shape.splineThru(getWavyEdgePoints(x + width, y + radius, x + width, y + height - radius));
    // Bottom-right corner
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

    // Bottom edge
    shape.splineThru(getWavyEdgePoints(x + width - radius, y + height, x + radius, y + height));
    // Bottom-left corner
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);

    // Left edge
    shape.splineThru(getWavyEdgePoints(x, y + height - radius, x, y + radius));
    // Top-left corner (to close the shape)
    shape.quadraticCurveTo(x, y, x + radius, y);
    
    return shape;
}

// Create the background planes with wavy shapes and distinct parameters for each.
const bgShape = createWavyRectShape(window.innerWidth * 0.3, window.innerHeight * 0.3, cornerRadius, 4, 30);
const bgGeometry = new THREE.ShapeGeometry(bgShape);
const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x0e0e0e });
const backgroundPlane = new THREE.Mesh(bgGeometry, bgMaterial);
backgroundPlane.position.set(0, 0, -200);

const midShape = createWavyRectShape(window.innerWidth * 0.25, window.innerHeight * 0.25, cornerRadius, 4, 25);
const midGeometry = new THREE.ShapeGeometry(midShape);
const midMaterial = new THREE.MeshBasicMaterial({ color: 0x1e1e1e });
const middlePlane = new THREE.Mesh(midGeometry, midMaterial);
middlePlane.position.set(0, 0, -190);

const frontShape = createWavyRectShape(window.innerWidth * 0.2, window.innerHeight * 0.2, cornerRadius, 4, 20);
const frontGeometry = new THREE.ShapeGeometry(frontShape);
const frontMaterial = new THREE.MeshBasicMaterial({ color: 0x2e2e2e });
const frontPlane = new THREE.Mesh(frontGeometry, frontMaterial);
frontPlane.position.set(0, 0, -180);

const geometry = new THREE.IcosahedronGeometry(10, 0);
const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
const dohe = new THREE.Mesh(geometry, material);
dohe.position.set(0, 0, -20);

const light = new THREE.PointLight(0xffffff, 50);

scene.add(dohe, light, backgroundPlane, middlePlane, frontPlane);

renderer.render(scene, camera);

const rotSpeed = 0.0005;
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
});

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

  backgroundPlane.position.x = mouseX * 2.5;
  backgroundPlane.position.y = mouseY * -1.25;
  middlePlane.position.x = mouseX * 5;
  middlePlane.position.y = mouseY * -2.5;
  frontPlane.position.x = mouseX * 7.5;
  frontPlane.position.y = mouseY * -3.75;
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
const chatWidget = document.getElementById('chat-widget');
const llmWarningPopup = document.getElementById('llm-warning-popup');
let llmWarningShown = false;

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

// Chat opening and initialization logic
function openChatAndInitLLM() {
  chatWidget.classList.remove('collapsed');
  chatWidget.classList.add('expanded');
  if (!engine.isInitialized) {
    initializeWebLLMEngine().then(() => {
      document.getElementById("send").disabled = false;
      if (initMessageContainer) {
        initMessageContainer.querySelector(".message").textContent = "Okay I'm ready!";
      }
    });
  }
}

// Toggle functionality with warning popup
document.getElementById('chat-toggle').addEventListener('click', () => {
  if (chatWidget.classList.contains('expanded')) {
    chatWidget.classList.remove('expanded');
    chatWidget.classList.add('collapsed');
  } else {
    if (!llmWarningShown) {
      llmWarningPopup.classList.remove('hidden');
    } else {
      openChatAndInitLLM();
    }
  }
});

document.querySelector('.close-chat').addEventListener('click', (e) => {
  e.stopPropagation();
  chatWidget.classList.remove('expanded');
  chatWidget.classList.add('collapsed');
});

// Popup button listeners
document.getElementById('proceed-chat-download').addEventListener('click', () => {
  llmWarningPopup.classList.add('hidden');
  llmWarningShown = true;
  openChatAndInitLLM();
});

document.getElementById('cancel-chat-download').addEventListener('click', () => {
  llmWarningPopup.classList.add('hidden');
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
    // For buttons, update the textContent. For inputs, update placeholder
    if (element.tagName === 'BUTTON') {
      element.textContent = element.getAttribute(`data-${currentLang}`);
    } else {
      element.textContent = element.getAttribute(`data-${currentLang}`);
    }
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
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

// ******************************  Snap-to-sections  ******************************
let scrollTimeout;
function scrollToNearestSection() {
  const sections = document.querySelectorAll('section');
  const scrollPosition = document.body.getBoundingClientRect().top * -1;

  let nearestSection = sections[0];
  let minDistance = Math.abs(scrollPosition - nearestSection.offsetTop);

  sections.forEach(section => {
    const distance = Math.abs(scrollPosition - section.offsetTop);
    if (distance < minDistance) {
      nearestSection = section;
      minDistance = distance;
    }
  });

  nearestSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(scrollToNearestSection, 100);
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
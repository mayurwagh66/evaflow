const toggle = document.getElementById('chatbotToggle');
const panel = document.getElementById('chatbotPanel');
const input = document.getElementById('chatInput');
const send = document.getElementById('chatSend');
const messages = document.getElementById('chatMessages');

if (toggle) toggle.addEventListener('click', () => panel?.classList.toggle('open'));

function addMessage(text, isUser) {
  if (!messages) return;
  const div = document.createElement('div');
  div.className = `chat-message ${isUser ? 'user' : 'bot'}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Default questions system
const defaultQuestions = {
  main: [
    {
      id: 'emissions',
      text: 'What are my total emissions?',
      icon: '🌍'
    },
    {
      id: 'routes',
      text: 'Which routes have highest emissions?',
      icon: '🛣️'
    },
    {
      id: 'carriers',
      text: 'Which carriers are most efficient?',
      icon: '🚚'
    },
    {
      id: 'reduction',
      text: 'How can I reduce emissions?',
      icon: '💡'
    },
    {
      id: 'trends',
      text: 'What are my emission trends?',
      icon: '📊'
    },
    {
      id: 'fuel',
      text: 'Which fuel types are best?',
      icon: '⛽'
    }
  ],
  sub: {
    emissions: [
      {
        id: 'total',
        text: 'Total CO₂ emissions',
        answer: 'Your total CO₂ emissions are calculated based on all shipments. Each shipment\'s emissions depend on distance, weight, truck type, and fuel type. The system automatically tracks and sums all emissions across your fleet.'
      },
      {
        id: 'per_shipment',
        text: 'Average per shipment',
        answer: 'Average emissions per shipment vary by route and truck type. Diesel trucks typically emit 0.6-0.9 kg CO₂ per km, while CNG and electric trucks have significantly lower emissions.'
      },
      {
        id: 'comparison',
        text: 'Compare to industry average',
        answer: 'Your emissions are compared against industry benchmarks. The average road freight operation emits around 0.8 kg CO₂ per ton-km. Your performance can be better or worse depending on your fleet efficiency.'
      }
    ],
    routes: [
      {
        id: 'high_emission',
        text: 'High emission routes',
        answer: 'High emission routes are typically long-distance routes with heavy loads using diesel trucks. Routes like Mumbai-Delhi, Delhi-Bangalore, and Mumbai-Chennai often have the highest emissions due to their distance and traffic conditions.'
      },
      {
        id: 'efficient',
        text: 'Most efficient routes',
        answer: 'The most efficient routes are typically shorter distances with optimal load factors. Routes like Bangalore-Chennai and Mumbai-Pune tend to have better efficiency due to shorter distances and good road conditions.'
      },
      {
        id: 'optimization',
        text: 'Route optimization tips',
        answer: 'To optimize routes: 1) Use alternative highways with less traffic, 2) Combine multiple shipments on same routes, 3) Plan routes during off-peak hours, 4) Consider rail transport for very long distances.'
      }
    ],
    carriers: [
      {
        id: 'best_performers',
        text: 'Top performing carriers',
        answer: 'The most efficient carriers are those with modern fleets, optimal load utilization, and eco-friendly practices. Look for carriers with newer trucks, regular maintenance, and fuel-efficient routing systems.'
      },
      {
        id: 'selection_criteria',
        text: 'How to choose carriers',
        answer: 'When selecting carriers: 1) Check their fleet age and maintenance records, 2) Ask about fuel types used, 3) Verify load optimization practices, 4) Consider their track record for on-time delivery.'
      },
      {
        id: 'improvement',
        text: 'Carrier improvement tips',
        answer: 'Help carriers improve by: 1) Sharing efficiency data and benchmarks, 2) Encouraging fuel-efficient driving practices, 3) Supporting load consolidation efforts, 4) Providing route optimization tools.'
      }
    ],
    reduction: [
      {
        id: 'quick_wins',
        text: 'Quick reduction strategies',
        answer: 'Quick wins: 1) Switch to CNG/LNG for high-frequency routes, 2) Improve load utilization from 75% to 90%, 3) Use route optimization software, 4) Train drivers in eco-friendly driving techniques.'
      },
      {
        id: 'long_term',
        text: 'Long-term solutions',
        answer: 'Long-term solutions: 1) Invest in electric vehicles for short routes, 2) Implement telematics for real-time monitoring, 3) Develop partnerships with green logistics providers, 4) Set up carbon offset programs.'
      },
      {
        id: 'roi',
        text: 'ROI of green initiatives',
        answer: 'Green initiatives typically show ROI within 2-3 years through: 1) Fuel cost savings (15-30%), 2) Improved operational efficiency, 3) Enhanced brand reputation, 4) Access to green shipping contracts.'
      }
    ],
    trends: [
      {
        id: 'monthly',
        text: 'Monthly emission patterns',
        answer: 'Monthly emissions typically vary with: 1) Seasonal demand changes, 2) Weather conditions affecting fuel efficiency, 3) Holiday traffic patterns, 4) Business cycle fluctuations. Track these to identify optimization opportunities.'
      },
      {
        id: 'forecasting',
        text: 'Emission forecasting',
        answer: 'Forecast emissions by: 1) Analyzing historical patterns, 2) Considering business growth plans, 3) Factoring in seasonal variations, 4) Including planned efficiency improvements.'
      },
      {
        id: 'benchmarking',
        text: 'Industry benchmarking',
        answer: 'Benchmark against: 1) Industry averages (0.8 kg CO₂/ton-km), 2) Best-in-class performers (0.4 kg CO₂/ton-km), 3) Regulatory requirements, 4) Customer sustainability expectations.'
      }
    ],
    fuel: [
      {
        id: 'comparison',
        text: 'Fuel type comparison',
        answer: 'Fuel efficiency comparison: Diesel (baseline), CNG (25-30% less CO₂), LNG (30-35% less CO₂), Electric (60-70% less CO₂), Hydrogen (future potential). Consider infrastructure and cost factors.'
      },
      {
        id: 'transition',
        text: 'Fuel transition strategy',
        answer: 'Transition strategy: 1) Start with CNG for accessible routes, 2) Pilot electric vehicles in cities, 3) Plan LNG for long-haul routes, 4) Monitor total cost of ownership.'
      },
      {
        id: 'cost_analysis',
        text: 'Cost vs emissions trade-off',
        answer: 'Cost-emission analysis: 1) Calculate total cost of ownership, 2) Include fuel, maintenance, and infrastructure costs, 3) Factor in potential carbon taxes, 4) Consider customer sustainability requirements.'
      }
    ]
  }
};

function showMainQuestions() {
  const questionsContainer = document.createElement('div');
  questionsContainer.className = 'quick-questions';
  questionsContainer.innerHTML = `
    <div class="questions-title">🤖 How can I help you today?</div>
    <div class="questions-grid">
      ${defaultQuestions.main.map(q => `
        <button class="question-btn" onclick="showSubQuestions('${q.id}')">
          <span class="question-icon">${q.icon}</span>
          <span class="question-text">${q.text}</span>
        </button>
      `).join('')}
    </div>
  `;
  messages.appendChild(questionsContainer);
  messages.scrollTop = messages.scrollHeight;
}

function showSubQuestions(mainId) {
  const subQuestions = defaultQuestions.sub[mainId];
  if (!subQuestions) return;
  
  // Remove previous questions
  const existingQuestions = messages.querySelector('.quick-questions');
  if (existingQuestions) {
    existingQuestions.remove();
  }
  
  const mainQuestion = defaultQuestions.main.find(q => q.id === mainId);
  addMessage(mainQuestion.text, true);
  
  const subContainer = document.createElement('div');
  subContainer.className = 'sub-questions';
  subContainer.innerHTML = `
    <div class="sub-questions-title">Choose a topic:</div>
    <div class="sub-questions-grid">
      ${subQuestions.map(q => `
        <button class="sub-question-btn" onclick="showAnswer('${mainId}', '${q.id}')">
          ${q.text}
        </button>
      `).join('')}
    </div>
  `;
  messages.appendChild(subContainer);
  messages.scrollTop = messages.scrollHeight;
}

function showAnswer(mainId, subId) {
  const subQuestions = defaultQuestions.sub[mainId];
  const question = subQuestions.find(q => q.id === subId);
  
  if (question) {
    // Remove sub-questions
    const existingSub = messages.querySelector('.sub-questions');
    if (existingSub) {
      existingSub.remove();
    }
    
    // Add the answer
    const answerDiv = document.createElement('div');
    answerDiv.className = 'chat-message bot';
    answerDiv.innerHTML = `
      <div class="answer-content">
        <div class="answer-text">${question.answer}</div>
        <div class="answer-actions">
          <button class="answer-btn" onclick="showMainQuestions()">🔄 More Questions</button>
          <button class="answer-btn" onclick="showDetailedInfo('${mainId}', '${subId}')">📊 Detailed Info</button>
        </div>
      </div>
    `;
    messages.appendChild(answerDiv);
    messages.scrollTop = messages.scrollHeight;
  }
}

function showDetailedInfo(mainId, subId) {
  const subQuestions = defaultQuestions.sub[mainId];
  const question = subQuestions.find(q => q.id === subId);
  
  showModal('detailed-info', {
    title: question.text,
    content: question.answer,
    type: mainId
  });
}

// Modal for detailed information
function showModal(type, data) {
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }

  let modalContent = '';
  
  if (type === 'detailed-info') {
    modalContent = createDetailedInfoModal(data);
  }
  
  const modalHTML = `
    <div class="modal-overlay" onclick="closeModalOnOverlay(event)">
      <div class="modal-container" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">📊 Detailed Information</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          ${modalContent}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    document.querySelector('.modal-overlay').classList.add('active');
  }, 10);
}

function createDetailedInfoModal(data) {
  return `
    <div class="detailed-info-modal">
      <div class="info-header">
        <h4>${data.title}</h4>
      </div>
      <div class="info-content">
        <p>${data.content}</p>
      </div>
      <div class="info-resources">
        <h5>📚 Additional Resources</h5>
        <div class="resources-grid">
          <div class="resource-item">
            <div class="resource-icon">📖</div>
            <div class="resource-text">
              <div class="resource-title">Sustainability Guide</div>
              <div class="resource-description">Complete guide to reducing carbon emissions</div>
            </div>
          </div>
          <div class="resource-item">
            <div class="resource-icon">📊</div>
            <div class="resource-text">
              <div class="resource-title">Analytics Dashboard</div>
              <div class="resource-description">Track your emission trends and metrics</div>
            </div>
          </div>
          <div class="resource-item">
            <div class="resource-icon">🎯</div>
            <div class="resource-text">
              <div class="resource-title">Action Plan</div>
              <div class="resource-description">Step-by-step implementation guide</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function closeModalOnOverlay(event) {
  if (event.target === event.currentTarget) {
    closeModal();
  }
}

async function sendMessage() {
  const msg = input?.value?.trim();
  if (!msg) return;
  
  input.value = '';
  addMessage(msg, true);
  
  // Try API first, fallback to questions if API fails
  try {
    console.log('Trying chatbot API...');
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    
    if (res.ok) {
      const data = await res.json();
      addMessage(data.response || 'No response.', false);
    } else {
      throw new Error('API not working');
    }
  } catch (e) {
    console.log('API failed, using fallback questions');
    addMessage('I\'m having trouble connecting to my AI brain. Let me help you with some common questions instead!', false);
    showMainQuestions();
  }
}

if (send) send.addEventListener('click', sendMessage);
if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// Add modal styles
function addModalStyles() {
  const modalStyles = `
    <style>
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
      }
      
      .modal-overlay.active {
        opacity: 1;
        visibility: visible;
      }
      
      .modal-container {
        background: white;
        border-radius: 16px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        transform: scale(0.9);
        transition: all 0.3s ease;
      }
      
      .modal-overlay.active .modal-container {
        transform: scale(1);
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .modal-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: #64748b;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      
      .modal-close:hover {
        background: #f1f5f9;
        color: #1e293b;
      }
      
      .modal-body {
        padding: 1.5rem;
      }
      
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem 1.5rem;
        border-top: 1px solid #e2e8f0;
      }
      
      .detailed-info-modal {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      
      .info-header h4 {
        color: #1e293b;
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
      }
      
      .info-content p {
        color: #475569;
        line-height: 1.6;
        margin: 0;
      }
      
      .info-resources h5 {
        color: #1e293b;
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
      }
      
      .resources-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .resource-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
      }
      
      .resource-item:hover {
        background: #f1f5f9;
        transform: translateX(4px);
      }
      
      .resource-icon {
        font-size: 1.5rem;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border-radius: 10px;
      }
      
      .resource-title {
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 0.25rem;
      }
      
      .resource-description {
        color: #64748b;
        font-size: 0.85rem;
      }
      
      .quick-questions {
        margin-top: 1rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }
      
      .questions-title {
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 1rem;
        text-align: center;
      }
      
      .questions-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      
      .question-btn {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        font-size: 0.9rem;
        color: #475569;
      }
      
      .question-btn:hover {
        background: #10b981;
        color: white;
        border-color: #10b981;
        transform: translateX(4px);
      }
      
      .question-icon {
        font-size: 1.2rem;
      }
      
      .sub-questions {
        margin-top: 1rem;
        padding: 1rem;
        background: #f1f5f9;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }
      
      .sub-questions-title {
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 1rem;
        font-size: 0.9rem;
      }
      
      .sub-questions-grid {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .sub-question-btn {
        padding: 0.5rem 1rem;
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        font-size: 0.85rem;
        color: #6b7280;
      }
      
      .sub-question-btn:hover {
        background: #10b981;
        color: white;
        border-color: #10b981;
      }
      
      .answer-content {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #10b981;
        margin-top: 0.5rem;
      }
      
      .answer-text {
        color: #475569;
        line-height: 1.6;
        margin-bottom: 1rem;
      }
      
      .answer-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      
      .answer-btn {
        padding: 0.5rem 1rem;
        background: #f1f5f9;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.8rem;
        color: #6b7280;
      }
      
      .answer-btn:hover {
        background: #10b981;
        color: white;
        border-color: #10b981;
      }
    </style>
  `;
  
  document.head.insertAdjacentHTML('beforeend', modalStyles);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  addModalStyles();
  console.log('Chatbot initialized with fallback questions');
});

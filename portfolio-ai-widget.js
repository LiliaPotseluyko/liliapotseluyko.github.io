(function() {
  // Prevent double loading
  if (window.__portfolioAIWidgetLoaded) return;
  window.__portfolioAIWidgetLoaded = true;

  // Get current script config
  const currentScript = document.currentScript || Array.from(document.querySelectorAll('script')).pop();
  const apiUrl = (currentScript && currentScript.getAttribute('data-api-url')) || 'https://ais-dev-kh6i6fvoruoczpnz5b3kvd-794039124315.europe-west2.run.app';
  const devName = (currentScript && currentScript.getAttribute('data-dev-name')) || 'Dr Lilia Potseluyko';
  const themeColor = (currentScript && currentScript.getAttribute('data-color')) || '#1DCD9F';

  // Inject Styles
  const style = document.createElement('style');
  style.textContent = `
    .pai-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: ${themeColor};
      color: #000;
      border: none;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      cursor: pointer;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .pai-widget-btn:hover {
      transform: scale(1.08);
    }
    .pai-widget-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 540px;
      max-height: calc(100vh - 120px);
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
      z-index: 99998;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #f4f4f5;
    }
    .pai-widget-window.open {
      display: flex;
    }
    .pai-widget-header {
      background: #121214;
      padding: 16px;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pai-widget-title {
      font-weight: 700;
      font-size: 15px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pai-widget-close {
      background: transparent;
      border: none;
      color: #a1a1aa;
      font-size: 18px;
      cursor: pointer;
    }
    .pai-widget-body {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .pai-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
    }
    .pai-msg-bot {
      background: #27272a;
      color: #f4f4f5;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    .pai-msg-user {
      background: ${themeColor};
      color: #000;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
      font-weight: 500;
    }
    .pai-widget-footer {
      padding: 12px;
      background: #121214;
      border-top: 1px solid #27272a;
      display: flex;
      gap: 8px;
    }
    .pai-widget-input {
      flex: 1;
      background: #27272a;
      border: 1px solid #3f3f46;
      border-radius: 8px;
      padding: 8px 12px;
      color: #fff;
      font-size: 14px;
      outline: none;
    }
    .pai-widget-send {
      background: ${themeColor};
      color: #000;
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      font-weight: 700;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Widget Markup
  const button = document.createElement('button');
  button.className = 'pai-widget-btn';
  button.innerHTML = '✨';
  button.setAttribute('aria-label', 'Open AI Assistant Chat');

  const win = document.createElement('div');
  win.className = 'pai-widget-window';
  win.innerHTML = `
    <div class="pai-widget-header">
      <div class="pai-widget-title">
        <span style="color:${themeColor}">✨</span> Ask ${devName} AI
      </div>
      <button class="pai-widget-close" id="paiCloseBtn">&times;</button>
    </div>
    <div class="pai-widget-body" id="paiMsgBody">
      <div class="pai-msg pai-msg-bot">
        Hello! I'm ${devName}'s AI Assistant. Ask me anything about research, projects, or technical skills.
      </div>
    </div>
    <div class="pai-widget-footer">
      <input type="text" class="pai-widget-input" id="paiInput" placeholder="Ask a question..." />
      <button class="pai-widget-send" id="paiSendBtn">Send</button>
    </div>
  `;

  document.body.appendChild(button);
  document.body.appendChild(win);

  // Behavior
  const msgBody = win.querySelector('#paiMsgBody');
  const input = win.querySelector('#paiInput');
  const sendBtn = win.querySelector('#paiSendBtn');
  const closeBtn = win.querySelector('#paiCloseBtn');

  button.addEventListener('click', () => {
    win.classList.toggle('open');
    if (win.classList.contains('open')) input.focus();
  });

  closeBtn.addEventListener('click', () => win.classList.remove('open'));

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    // Append User Msg
    const userMsg = document.createElement('div');
    userMsg.className = 'pai-msg pai-msg-user';
    userMsg.textContent = text;
    msgBody.appendChild(userMsg);
    input.value = '';
    msgBody.scrollTop = msgBody.scrollHeight;

    // Append Loading Bot Msg
    const botMsg = document.createElement('div');
    botMsg.className = 'pai-msg pai-msg-bot';
    botMsg.textContent = 'Thinking...';
    msgBody.appendChild(botMsg);
    msgBody.scrollTop = msgBody.scrollHeight;

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode: 'general' })
      });
      const data = await res.json();
      botMsg.textContent = data.text || 'No response received.';
    } catch (e) {
      botMsg.textContent = 'Error connecting to AI service.';
    }
    msgBody.scrollTop = msgBody.scrollHeight;
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
})();

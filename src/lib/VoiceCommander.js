import * as THREE from 'three';

export class VoiceCommander {
  constructor(context) {
    this.ctx = context;
    this.recognition = null;
    this.isListening = false;
    this.commands = [];
    this.currentLanguage = 'de';

    this.elementCommands = {
      de: {
        trigger: 'zeige mir',
        element: 'element'
      },
      en: {
        trigger: 'show me',
        element: 'element'
      }
    };

    this.setupUI();
  }

  setupUI() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'voice-status';
    statusDiv.style.css = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      padding: 15px 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      color: white;
      z-index: 1000;
      font-size: 16px;
      pointer-events: none;
    `;
    statusDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <button id="voice-toggle" style="
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 20px;
          padding: 10px 20px;
          color: white;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
        ">
          🎤 Mikrofon an
        </button>
      </div>
      <div id="voice-text" style="
        font-size: 18px;
        margin-top: 10px;
        min-height: 24px;
      );
        Sprechen Sie "Zeige mir Element" oder "Show me Element"
      </div>
    `;
    document.body.appendChild(statusDiv);
  }

  async init() {
    if (!('webkitSpeechRecognition' in window) {
      console.warn('Web Speech API not supported');
      this.setupUI();
      return;
    }

    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = this.currentLanguage === 'de' ? 'de-DE' : 'en-US';

    this.setupEventListeners();
    await this.recognition.start();

    console.log('Voice recognition initialized');
  }

  setupEventListeners() {
    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateStatus('Zuhört...');
      this.executeCommand(this.recognition.transcript || '');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.updateStatus('Bereit');
    };
  }

  async startListening() {
    this.stop();
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      await this.recognition.start();

      const timeout = setTimeout(() => {
        this.recognition.stop();
        resolve(false);
      }, 5000);

      this.isListening = true;
      this.updateStatus('Zuhört...');

      const result = await Promise.race([
        this.recognition.start(),
        timeout
      ]);

      this.recognition.stop();
      this.isListening = false;
      this.updateStatus('Bereit');

      resolve(result);
    } catch (error) {
      console.error('Voice recognition error:', error);
      this.recognition.stop();
      resolve(false);
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
    }
    this.updateStatus('Bereit');
  }

  updateStatus(text) {
    const statusText = document.getElementById('voice-text');
    if (statusText) {
      statusText.textContent = text;
    }
  }

  async executeCommand(transcript) {
    if (!transcript || !transcript.trim()) return null;

    const lowerTranscript = transcript.toLowerCase();
    const commands = this.elementCommands[this.currentLanguage];

    let element = null;
    let roomId = null;

    const commandPattern = new RegExp(commands.trigger + '\\s+(' + commands.element + '(\\s+[a-zäöüß]+)?', 'i');

    const triggerMatch = lowerTranscript.match(commands.trigger);

    if (triggerMatch) {
      if (triggerMatch.index > -1) {
        const afterTrigger = lowerTranscript.substring(triggerMatch.index + triggerMatch[0].length).trim();

        if (this.currentLanguage === 'de') {
          if (afterTrigger.includes('und') || afterTrigger.includes('und die')) {
            afterTrigger = afterTrigger.replace(/und die/, '');
          }

          const elementName = afterTrigger.trim();
          element = this.findElementByName(elementName);
        } else {
          const showMatch = lowerTranscript.match(/show\s+me\s+(\w+)(?:\s+of)?/i);
          if (showMatch) {
            const afterShow = lowerTranscript.substring(showMatch.index + 4).trim();
            element = this.findElementByName(afterShow);
          } else {
            const showMatch = lowerTranscript.match(/show\s+(\w+)(?:\s+of)?/i);
            if (showMatch) {
              const afterShow = lowerTranscript.substring(showMatch.index + 4).trim();
              element = this.findElementByName(afterShow);
            }
          }
        }
      } else if (commands.element && triggerMatch.index === -1) {
        element = this.extractElement(transcript);
      }

      if (element) {
        console.log(`Voice command: Navigate to ${element.symbol}`);
        this.commands.push({
          type: 'navigate',
          element: element,
          timestamp: Date.now()
        });

        return element;
      }
    }

    return null;
  }

  findElementByName(name) {
    if (this.ctx && this.ctx.assets) {
      const elements = this.ctx.assets.elements;

      const normalized = name.toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss');

      return elements.find(e => 
        e.name.toLowerCase().replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .includes(normalized) ||
        e.symbol.toLowerCase() === normalized ||
        normalized.includes(e.name.toLowerCase())
      );
    }

    return null;
  }

  extractElement(text) {
    const elementNames = [];
    const words = text.toLowerCase().split(/[\s,.,!?]+/);

    for (const word of words) {
      if (word.length < 2) continue;

      if (ELEMENTS.some(e => {
        const name = e.name.toLowerCase();
        return name.includes(word) ||
               name === word ||
               e.symbol.toLowerCase() === word ||
               normalized.includes(name);
      })) {
        elementNames.push(word);
      }
    }

    if (elementNames.length === 1) {
      return ELEMENTS.find(e =>
        elementNames.includes(e.name.toLowerCase()) ||
        elementNames.includes(e.symbol.toLowerCase())
      );
    }

    return null;
  }

  getRecentCommands() {
    const now = Date.now();
    const recent = this.commands.filter(cmd =>
      cmd.timestamp && (now - cmd.timestamp) < 10000
    );

    return recent;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  setLanguage(lang) {
    if (['de', 'en'].includes(lang)) {
      this.currentLanguage = lang;
      this.updateStatus(`Sprache: ${lang.toUpperCase()}`);
    }
  }
}

export default VoiceCommander;

import type { Scene, Mesh } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, Rectangle, Control } from '@babylonjs/gui/2D';

export interface TriviaCard {
  front: ContentPanel;
  back: ContentPanel;
  isFlipped: boolean;
}

export interface ContentPanel {
  title: string;
  body: string[];
  color?: string;
  icon?: string;
}

export interface ExperimentButton {
  experimentId: string;
  label: string;
  roomId: number;
}

export class InteractiveContent {
  private static readonly CARD_FLIP_DURATION = 300;

  /**
   * Create trivia card with flip animation
   */
  static createTriviaCard(
    scene: Scene,
    parent: AdvancedDynamicTexture,
    position: { x: number; y: number },
    title: string,
    lines: string[],
    onClick?: () => void
  ): TriviaCard {
    const cardWidth = 0.3;
    const cardHeight = 0.4;

    const front = new Rectangle('CardFront');
    front.width = `${cardWidth * 100}%`;
    front.height = `${cardHeight * 100}%`;
    front.thickness = 0.001;
    front.cornerRadius = 0.02;
    front.background = '#2D3748';
    front.alpha = 0.9;

    const titleText = new TextBlock('CardTitle', title);
    titleText.color = 'white';
    titleText.fontSize = 14;
    titleText.fontWeight = 'bold';
    titleText.textWrapping = true;
    front.addControl(titleText);

    const bodyText = new TextBlock('CardBody', lines.join('\n'));
    bodyText.color = '#CBD5E0';
    bodyText.fontSize = 12;
    bodyText.textWrapping = true;
    bodyText.resizeToFit = true;
    front.addControl(bodyText);

    parent.addControl(front);
    front.left = position.x;
    front.top = position.y;
    front.verticalAlignment = Rectangle.VERTICAL_ALIGNMENT_TOP;

    return {
      front: {
        title,
        body: lines,
      },
      back: {
        title: 'Did you know?',
        body: ['Click to discover\nmore facts'],
      },
      isFlipped: false,
    };
  }

  /**
   * Flip trivia card from front to back
   */
  static flipCard(card: TriviaCard, elementData: any): void {
    if (card.isFlipped) return;

    // Add element-specific facts to back
    card.back.title = `${elementData.symbol} Facts`;
    card.back.body = this.getElementFacts(elementData);

    card.isFlipped = true;
  }

  /**
   * Get random element facts
   */
  private static getElementFacts(element: any): string[] {
    const facts: string[] = [];

    // Atomic properties
    if (element.atomicNumber) {
      facts.push(`Atomic number: ${element.atomicNumber}`);
    }
    if (element.mass) {
      facts.push(`Atomic mass: ${element.mass}`);
    }

    // Historical significance
    if (element.theme === 'historical') {
      facts.push(`Discovered in 1898 by Marie Curie`);
      facts.push('Used in early cancer treatments');
    }

    // Group-specific facts
    if (element.group === 'alkali') {
      facts.push('Highly reactive with water');
      facts.push('Stored under oil to prevent reactions');
    }
    if (element.group === 'alkalineEarth') {
      facts.push('Less reactive than alkali metals');
      facts.push('Found in bones and teeth (calcium)');
    }

    return facts;
  }

  /**
   * Create experiment button
   */
  static createExperimentButton(
    scene: Scene,
    parent: AdvancedDynamicTexture,
    experiment: ExperimentButton,
    onClick: () => void
  ): Rectangle {
    const btn = new Rectangle(`ExpBtn_${experiment.experimentId}`);
    btn.width = '100px';
    btn.height = '40px';
    btn.cornerRadius = 0.02;
    btn.background = '#3182CE';
    btn.alpha = 0.9;
    btn.thickness = 0.001;
    btn.cornerRadius = 0.02;
    btn.background = '#3182CE';
    btn.alpha = 0.9;
    btn.thickness = 0.001;

    const btnText = new TextBlock('ExpBtnText', experiment.label);
    btnText.color = 'white';
    btnText.fontSize = 12;
    btnText.fontWeight = 'bold';
    btn.addControl(btnText);

    parent.addControl(btn);
    btn.onPointerDownObservable.add(onClick);

    return btn;
  }
}
// CodePoetry.ts - Transform Code into Poetry with AI
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CodePoem {
  id: string;
  originalCode: string;
  language: string;
  poem: string;
  style: PoemStyle;
  theme: string;
  author: string;
  createdAt: Date;
  likes: string[];
  shares: number;
  audioUrl?: string;
}

type PoemStyle = 'haiku' | 'sonnet' | 'limerick' | 'free-verse' | 'epic' | 'rap';

interface PoemTheme {
  name: string;
  keywords: string[];
  metaphors: string[];
  mood: string;
}

export class CodePoetry {
  private static instance: CodePoetry;
  private poems: Map<string, CodePoem>;
  private themes: Map<string, PoemTheme>;
  
  private constructor() {
    this.poems = new Map();
    this.themes = new Map();
    this.initializeThemes();
  }

  public static getInstance(): CodePoetry {
    if (!CodePoetry.instance) {
      CodePoetry.instance = new CodePoetry();
    }
    return CodePoetry.instance;
  }

  private initializeThemes() {
    this.themes.set('debugging', {
      name: 'The Bug Hunter',
      keywords: ['hunt', 'search', 'trace', 'fix', 'solve'],
      metaphors: ['detective', 'hunter', 'explorer', 'warrior'],
      mood: 'determined',
    });

    this.themes.set('creation', {
      name: 'The Creator',
      keywords: ['build', 'craft', 'design', 'create', 'forge'],
      metaphors: ['artist', 'architect', 'sculptor', 'painter'],
      mood: 'inspired',
    });

    this.themes.set('optimization', {
      name: 'The Optimizer',
      keywords: ['speed', 'efficiency', 'performance', 'streamline'],
      metaphors: ['racer', 'athlete', 'eagle', 'lightning'],
      mood: 'focused',
    });

    this.themes.set('collaboration', {
      name: 'The Team',
      keywords: ['together', 'merge', 'unite', 'collaborate', 'sync'],
      metaphors: ['orchestra', 'dance', 'symphony', 'harmony'],
      mood: 'harmonious',
    });

    this.themes.set('deployment', {
      name: 'The Launch',
      keywords: ['deploy', 'launch', 'release', 'ship', 'deliver'],
      metaphors: ['rocket', 'ship', 'bird', 'arrow'],
      mood: 'triumphant',
    });
  }

  // Generate poem from code
  public async generatePoem(
    code: string,
    language: string,
    style: PoemStyle = 'haiku'
  ): Promise<CodePoem> {
    // Analyze code structure
    const analysis = this.analyzeCode(code, language);
    
    // Select appropriate theme
    const theme = this.selectTheme(analysis);
    
    // Generate poem based on style
    const poem = await this.createPoem(analysis, theme, style);
    
    // Create poem object
    const codePoem: CodePoem = {
      id: `poem_${Date.now()}`,
      originalCode: code,
      language,
      poem,
      style,
      theme: theme.name,
      author: 'AI Poet',
      createdAt: new Date(),
      likes: [],
      shares: 0,
    };
    
    // Save poem
    this.poems.set(codePoem.id, codePoem);
    await this.savePoem(codePoem);
    
    return codePoem;
  }

  private analyzeCode(code: string, language: string): any {
    const analysis = {
      lines: code.split('\n').length,
      functions: this.extractFunctions(code, language),
      variables: this.extractVariables(code, language),
      loops: this.countLoops(code),
      conditionals: this.countConditionals(code),
      comments: this.extractComments(code),
      complexity: this.calculateComplexity(code),
      purpose: this.inferPurpose(code),
      emotions: this.detectEmotions(code),
    };
    
    return analysis;
  }

  private extractFunctions(code: string, language: string): string[] {
    const functions: string[] = [];
    
    if (language === 'javascript' || language === 'typescript') {
      const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=]*)=>)/g;
      let match;
      while ((match = functionRegex.exec(code)) !== null) {
        functions.push(match[1] || match[2]);
      }
    } else if (language === 'python') {
      const functionRegex = /def\s+(\w+)\s*\(/g;
      let match;
      while ((match = functionRegex.exec(code)) !== null) {
        functions.push(match[1]);
      }
    }
    
    return functions;
  }

  private extractVariables(code: string, language: string): string[] {
    const variables: string[] = [];
    
    if (language === 'javascript' || language === 'typescript') {
      const varRegex = /(?:let|const|var)\s+(\w+)/g;
      let match;
      while ((match = varRegex.exec(code)) !== null) {
        variables.push(match[1]);
      }
    } else if (language === 'python') {
      const varRegex = /(\w+)\s*=\s*[^=]/g;
      let match;
      while ((match = varRegex.exec(code)) !== null) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  }

  private countLoops(code: string): number {
    const loopPatterns = [/for\s*\(/g, /while\s*\(/g, /do\s*{/g, /\.forEach\(/g, /\.map\(/g];
    return loopPatterns.reduce((count, pattern) => 
      count + (code.match(pattern) || []).length, 0
    );
  }

  private countConditionals(code: string): number {
    const conditionalPatterns = [/if\s*\(/g, /else\s+if\s*\(/g, /switch\s*\(/g, /\?\s*:/g];
    return conditionalPatterns.reduce((count, pattern) => 
      count + (code.match(pattern) || []).length, 0
    );
  }

  private extractComments(code: string): string[] {
    const comments: string[] = [];
    
    // Single line comments
    const singleLineRegex = /\/\/\s*(.+)$/gm;
    let match;
    while ((match = singleLineRegex.exec(code)) !== null) {
      comments.push(match[1]);
    }
    
    // Multi-line comments
    const multiLineRegex = /\/\*[\s\S]*?\*\//g;
    while ((match = multiLineRegex.exec(code)) !== null) {
      comments.push(match[0].replace(/\/\*|\*\//g, '').trim());
    }
    
    return comments;
  }

  private calculateComplexity(code: string): number {
    const loops = this.countLoops(code);
    const conditionals = this.countConditionals(code);
    const lines = code.split('\n').length;
    
    return loops * 3 + conditionals * 2 + Math.floor(lines / 10);
  }

  private inferPurpose(code: string): string {
    const codeLower = code.toLowerCase();
    
    if (codeLower.includes('test') || codeLower.includes('assert')) {
      return 'testing';
    }
    if (codeLower.includes('fetch') || codeLower.includes('api') || codeLower.includes('request')) {
      return 'networking';
    }
    if (codeLower.includes('render') || codeLower.includes('component') || codeLower.includes('view')) {
      return 'ui';
    }
    if (codeLower.includes('save') || codeLower.includes('database') || codeLower.includes('storage')) {
      return 'data';
    }
    if (codeLower.includes('calculate') || codeLower.includes('algorithm') || codeLower.includes('process')) {
      return 'logic';
    }
    
    return 'general';
  }

  private detectEmotions(code: string): string[] {
    const emotions: string[] = [];
    
    // Check comments for emotions
    const comments = this.extractComments(code);
    const emotionalWords = {
      frustration: ['wtf', 'damn', 'hell', 'stupid', 'broken', 'fix this'],
      joy: ['works', 'finally', 'yes', 'awesome', 'great', 'perfect'],
      uncertainty: ['todo', 'fixme', 'hack', 'not sure', 'maybe', 'probably'],
      pride: ['clever', 'elegant', 'beautiful', 'clean', 'optimized'],
    };
    
    comments.forEach(comment => {
      const commentLower = comment.toLowerCase();
      Object.entries(emotionalWords).forEach(([emotion, words]) => {
        if (words.some(word => commentLower.includes(word))) {
          emotions.push(emotion);
        }
      });
    });
    
    return [...new Set(emotions)];
  }

  private selectTheme(analysis: any): PoemTheme {
    // Select theme based on code analysis
    if (analysis.emotions.includes('frustration') || analysis.purpose === 'testing') {
      return this.themes.get('debugging')!;
    }
    if (analysis.purpose === 'ui' || analysis.functions.length > 5) {
      return this.themes.get('creation')!;
    }
    if (analysis.complexity > 15) {
      return this.themes.get('optimization')!;
    }
    if (analysis.functions.includes('merge') || analysis.functions.includes('commit')) {
      return this.themes.get('collaboration')!;
    }
    if (analysis.functions.includes('deploy') || analysis.functions.includes('build')) {
      return this.themes.get('deployment')!;
    }
    
    return this.themes.get('creation')!;
  }

  private async createPoem(analysis: any, theme: PoemTheme, style: PoemStyle): Promise<string> {
    switch (style) {
      case 'haiku':
        return this.generateHaiku(analysis, theme);
      case 'sonnet':
        return this.generateSonnet(analysis, theme);
      case 'limerick':
        return this.generateLimerick(analysis, theme);
      case 'free-verse':
        return this.generateFreeVerse(analysis, theme);
      case 'epic':
        return this.generateEpic(analysis, theme);
      case 'rap':
        return this.generateRap(analysis, theme);
      default:
        return this.generateHaiku(analysis, theme);
    }
  }

  private generateHaiku(analysis: any, theme: PoemTheme): string {
    const templates = [
      {
        line1: (a: any) => `${a.functions.length || 'Many'} functions dance`,
        line2: (a: any) => `Through ${a.loops || 'endless'} loops they ${theme.keywords[0]}`,
        line3: (a: any) => `Code ${theme.mood} flows`,
      },
      {
        line1: (a: any) => `Variables ${theme.keywords[1]}`,
        line2: (a: any) => `${a.conditionals || 'Logic'} branches like a tree`,
        line3: (a: any) => `${theme.metaphors[0]} at work`,
      },
      {
        line1: (a: any) => `Lines of ${a.purpose} code`,
        line2: (a: any) => `${theme.metaphors[1]} shapes the data flow`,
        line3: (a: any) => `Beauty emerges`,
      },
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return [
      template.line1(analysis),
      template.line2(analysis),
      template.line3(analysis),
    ].join('\n');
  }

  private generateLimerick(analysis: any, theme: PoemTheme): string {
    const rhymes = {
      code: ['node', 'mode', 'load', 'road'],
      function: ['junction', 'compunction', 'conjunction'],
      loop: ['group', 'scoop', 'troop'],
      bug: ['debug', 'hug', 'shrug'],
    };
    
    const templates = [
      `There once was a ${theme.metaphors[0]} so bright,
Who coded from morning till night,
With ${analysis.functions.length} functions to ${theme.keywords[0]},
And loops that would ${theme.keywords[1]},
The bugs didn't stand a chance in the fight!`,
      
      `A developer ${theme.mood} and keen,
Built the cleanest code ever seen,
${analysis.conditionals} conditions to test,
Each function the best,
Like a well-oiled coding machine!`,
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateFreeVerse(analysis: any, theme: PoemTheme): string {
    const lines = [
      `In the realm of ${analysis.lines} lines,`,
      `Where ${theme.metaphors[0]}s craft their art,`,
      ``,
      `Functions rise like ${theme.metaphors[1]}s,`,
      `${analysis.functions[0] || 'Each one'} a brushstroke`,
      `on the canvas of logic.`,
      ``,
      `${analysis.loops} loops spin endlessly,`,
      `weaving patterns of ${theme.keywords[0]},`,
      `while conditionals stand guard,`,
      `gatekeepers of possibility.`,
      ``,
      `Variables hold secrets,`,
      `${analysis.variables[0] || 'data'} flowing like rivers`,
      `through the landscape of memory.`,
      ``,
      `This is ${theme.mood} creation,`,
      `where human thought becomes`,
      `digital poetry.`,
    ];
    
    return lines.join('\n');
  }

  private generateSonnet(analysis: any, theme: PoemTheme): string {
    // Simplified sonnet structure (14 lines, ABAB CDCD EFEF GG)
    return `
When first I gazed upon this ${analysis.purpose} code,
${analysis.functions.length} functions standing proud and tall,
Each line a step upon the ${theme.metaphors[0]}'s road,
Where ${theme.keywords[0]} and ${theme.keywords[1]} heed the call.

Through ${analysis.loops} iterations we traverse,
The data flowing like a ${theme.metaphors[1]}'s dream,
While ${analysis.conditionals} branches, for better or worse,
Guide execution down each chosen stream.

Variables dance in memory's embrace,
${analysis.variables[0] || 'Constants'} holding values tried and true,
Comments whisper secrets in this space,
Explaining what each function aims to do.

  So here in silicon and electric light,
  We ${theme.metaphors[2]}s code through day and into night.`;
  }

  private generateEpic(analysis: any, theme: PoemTheme): string {
    return `
THE ${theme.name.toUpperCase()}

Book I: The Invocation
Sing, O Muse of Silicon and Light,
Of ${theme.metaphors[0]}s who code through endless night,
Tell of the quest for ${analysis.purpose} pure and bright,
Where ${analysis.functions.length} functions join the fight.

Book II: The Journey Begins
In lands of ${analysis.lines} lines they ventured forth,
Through forests dark of nested loops,
Past ${analysis.conditionals} gates that test one's worth,
Where variables gather in their groups.

Book III: The Challenge
Behold! The ${theme.metaphors[1]} faces trials severe,
Complexity of ${analysis.complexity} bars the way,
But with ${theme.keywords[0]} as their spear,
They ${theme.keywords[1]} to see another day.

Book IV: The Triumph
At last the code compiles so clean,
No errors mar the console screen,
The ${theme.metaphors[2]} stands victorious and proud,
Their ${theme.mood} song echoing clear and loud.

Book V: The Return
And so our tale of code comes to an end,
Where functions, loops, and logic blend,
In digital realms where ${theme.metaphors[0]}s transcend,
The boundary 'tween machine and friend.`;
  }

  private generateRap(analysis: any, theme: PoemTheme): string {
    return `
Yo, check it, I'm the ${theme.metaphors[0]} with the code so clean,
${analysis.functions.length} functions on my screen, you know what I mean?
I ${theme.keywords[0]} through the logic like a machine,
Most ${theme.mood} developer you've ever seen!

(Chorus)
Compile, run, debug, repeat,
${analysis.loops} loops got that infinite beat,
Variables stored, the flow's complete,
In the IDE where the legends meet!

Verse 2:
${analysis.conditionals} if-statements, I'm making decisions,
Code so sharp, surgical precision,
No bugs in my vision, that's my mission,
Push to production, no collision!

I'm typing at the speed of light,
${analysis.lines} lines of code, all night,
Documentation? Yeah, I write it right,
Stack Overflow? Nah, I got this fight!

(Outro)
From zero to deployed, that's how we roll,
${theme.metaphors[1]} of the console, that's my goal,
Git commit, push it, on a roll,
The ${theme.name}, that's my soul!`;
  }

  // Share poem
  public async sharePoem(poemId: string): Promise<void> {
    const poem = this.poems.get(poemId);
    if (!poem) return;
    
    poem.shares++;
    await this.savePoem(poem);
  }

  // Like poem
  public async likePoem(poemId: string, userId: string): Promise<void> {
    const poem = this.poems.get(poemId);
    if (!poem) return;
    
    if (!poem.likes.includes(userId)) {
      poem.likes.push(userId);
      await this.savePoem(poem);
    }
  }

  // Generate audio narration
  public async generateAudio(poemId: string): Promise<string> {
    // In production, use TTS service
    // For now, return placeholder
    return `audio_${poemId}.mp3`;
  }

  // Save poem
  private async savePoem(poem: CodePoem): Promise<void> {
    try {
      const poems = await this.getAllPoems();
      const index = poems.findIndex(p => p.id === poem.id);
      
      if (index >= 0) {
        poems[index] = poem;
      } else {
        poems.push(poem);
      }
      
      await AsyncStorage.setItem('code_poems', JSON.stringify(poems));
    } catch (error) {
      console.error('Failed to save poem:', error);
    }
  }

  // Get all poems
  public async getAllPoems(): Promise<CodePoem[]> {
    try {
      const saved = await AsyncStorage.getItem('code_poems');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load poems:', error);
      return [];
    }
  }

  // Get poem by ID
  public getPoem(poemId: string): CodePoem | undefined {
    return this.poems.get(poemId);
  }

  // Get popular poems
  public async getPopularPoems(limit: number = 10): Promise<CodePoem[]> {
    const poems = await this.getAllPoems();
    return poems
      .sort((a, b) => b.likes.length - a.likes.length)
      .slice(0, limit);
  }

  // Get poems by style
  public async getPoemsByStyle(style: PoemStyle): Promise<CodePoem[]> {
    const poems = await this.getAllPoems();
    return poems.filter(p => p.style === style);
  }

  // Poem battle - compare two code snippets
  public async poemBattle(code1: string, code2: string, language: string): Promise<{
    poem1: CodePoem;
    poem2: CodePoem;
    winner: 'poem1' | 'poem2' | 'tie';
    reason: string;
  }> {
    const poem1 = await this.generatePoem(code1, language, 'haiku');
    const poem2 = await this.generatePoem(code2, language, 'haiku');
    
    // Compare complexity and elegance
    const analysis1 = this.analyzeCode(code1, language);
    const analysis2 = this.analyzeCode(code2, language);
    
    let winner: 'poem1' | 'poem2' | 'tie' = 'tie';
    let reason = 'Both poems are equally beautiful';
    
    if (analysis1.complexity < analysis2.complexity && analysis1.lines < analysis2.lines) {
      winner = 'poem1';
      reason = 'More elegant and concise';
    } else if (analysis2.complexity < analysis1.complexity && analysis2.lines < analysis1.lines) {
      winner = 'poem2';
      reason = 'More elegant and concise';
    }
    
    return {poem1, poem2, winner, reason};
  }
}

import {PersonalAssistant} from '../../app/ai/assistants/PersonalAssistant';

describe('PersonalAssistant', () => {
  let assistant: PersonalAssistant;

  beforeEach(() => {
    assistant = PersonalAssistant.getInstance({preferredProvider: 'openai'});
  });

  it('should be a singleton', () => {
    const instance1 = PersonalAssistant.getInstance();
    const instance2 = PersonalAssistant.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should generate smart replies', async () => {
    const replies = await assistant.generateSmartReplies('Hello, how are you?');
    expect(Array.isArray(replies)).toBe(true);
    expect(replies.length).toBeGreaterThan(0);
  });

  it('should classify questions', async () => {
    const classification = await assistant.classifyQuestion('What is the weather?');
    expect(classification).toBeDefined();
    expect(classification.category).toBeDefined();
  });

  it('should detect urgency', async () => {
    const urgent = await assistant.detectUrgency('This is urgent!');
    const normal = await assistant.detectUrgency('Hello');
    
    expect(urgent).toBeGreaterThan(normal);
  });

  it('should extract topics', async () => {
    const topics = await assistant.extractTopic('Meeting about project deadline');
    expect(topics).toBeDefined();
    expect(topics.length).toBeGreaterThan(0);
  });
});



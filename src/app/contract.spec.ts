import {ChatConfig} from './contract';

describe('Contract', () => {
  it('should create an instance', () => {
    let chatConfig = new ChatConfig();
    expect(chatConfig).toBeTruthy();
    expect(chatConfig.wssUri).toBe("wss://webmessaging.inindca.com/v1");
  });
});

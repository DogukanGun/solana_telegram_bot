import { TradeTool } from './tradeTool';
import { DefineAgentTool } from './defineAgentTool';
import { GetActiveAgentsTool } from './getActiveAgentsTool';
// Export the tools
export const getTools = (chatId: string) => [
  new TradeTool(chatId),
  new DefineAgentTool(chatId),
  new GetActiveAgentsTool(chatId),
]; 
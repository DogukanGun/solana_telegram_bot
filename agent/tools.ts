import { TradeTool } from './tradeTool';
import { DefineAgentTool } from './defineAgentTool';
import { GetActiveAgentsTool } from './getActiveAgentsTool';
import { AgentSettingsTool } from './agentSetingsTool';
import { GetWalletTool } from './getWallet';
// Export the tools
export const getTools = (chatId: string) => [
  new TradeTool(chatId),
  new DefineAgentTool(chatId),
  new GetActiveAgentsTool(chatId),
  new AgentSettingsTool(chatId),
  new GetWalletTool(chatId)
]; 
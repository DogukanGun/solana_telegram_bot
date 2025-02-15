import { Tool } from "langchain/tools";
import { Para as ParaServer, Environment, WalletType } from "@getpara/server-sdk";
import { decrypt, encrypt } from "../utils/encryption-utils";
import { prisma } from "../prisma/client";

export class AgentSettingsTool extends Tool {
  chatId: string;
  paraClient: ParaServer;

  name = 'agentSettings';
  description = `When a user needs to set a wallet for his/her agent. Input should be a JSON string with the following format:
  {
    "agentName": "string",
    "action": "create|import",
    "walletData": "string" // For import, this should be the encrypted wallet data
  }`;

  constructor(chatId: string) {
    super();
    this.chatId = chatId;
    const PARA_API_KEY = process.env.PARA_API_KEY;
    this.paraClient = new ParaServer(Environment.BETA, PARA_API_KEY);
  }

  async _call(input: string) {
    const { agentName, action, walletData } = JSON.parse(input);

    if (action === "create") {
      try {
        const newWallet = await this.paraClient.createPregenWallet({
          type: WalletType.SOLANA,
          pregenIdentifier: this.chatId,
          pregenIdentifierType: "CUSTOM_ID"
        });
        if (!newWallet.userId) {
          return "Failed to create wallet";
        }
        const encryptedKeyShare = encrypt(newWallet.userId);
        await prisma.wallet.create({
          data: {
            chatId: this.chatId,
            keyShare: encryptedKeyShare,
            groupId: this.chatId
          }
        });
        return `Wallet created for agent ${agentName} with chat ID ${this.chatId}.`;
      } catch (error) {
        console.error("Error creating wallet:", error);
        return "Failed to create wallet";
      }

    } else if (action === "import") {
      const decryptedWalletData = decrypt(walletData);
      await prisma.wallet.create({
        data: {
          chatId: this.chatId,
          keyShare: decryptedWalletData,
          groupId: this.chatId
        }
      });
      return `Wallet imported for agent ${agentName} with chat ID ${this.chatId}.`;
    } else {
      return "Invalid action. Use 'create' or 'import'.";
    }
  }
}
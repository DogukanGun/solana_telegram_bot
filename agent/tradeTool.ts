import { Tool } from 'langchain/tools';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TradeTool extends Tool {
  chatId: string;
  name = 'trade';
  description = `Handles trade commands. Input should be a JSON string with the following format:
  {
    "tradeDemand": "string"
  }`;

  constructor(chatId: string) {
    super();
    this.chatId = chatId;
  }

  async _call(input: string) {
    try {
      // Return the trade demand as text for further processing by another agent
      return this.executeTrade(input);
    } catch (error) {
      console.error("Error processing trade command:", error, input);
      throw new Error("Invalid input format. Please provide a command like: 'I want to trade [amount] [fromCurrency] for [toCurrency]'.");
    }
  }


  private async executeTrade(input: string): Promise<string> {
    // Here you would implement the logic to create and send a transaction
    // For example, you might need to parse the tradeDemand to get the necessary details
    return `Trade demand captured: ${input}`;
  }
} 
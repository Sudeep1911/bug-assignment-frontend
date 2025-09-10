import { EngineInstanse, options } from './fetch';

export const getChat = async (chatId: string) => {
  try {
    const result = await EngineInstanse.get(`/chat/${chatId}/messages`, options);
    return result.data;
  } catch (e) {
    console.log('error', e);
  }
};

export const sendMessageToChat = async (chatId: string, newMessage: any) => {
  try {
    const result = await EngineInstanse.post(
      `/chat/${chatId}/messages`, // The endpoint from your NestJS controller
      newMessage,
      options, // Assuming 'options' contains headers like 'Content-Type'
    );
    return result.data;
  } catch (e) {
    console.log('Error sending chat message:', e);
    throw e; // Re-throw the error to be handled by the calling function
  }
};

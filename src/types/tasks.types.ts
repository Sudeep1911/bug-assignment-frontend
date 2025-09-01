export interface ChatAttachment {
  id: string;
  type: 'image' | 'video';
  url: string; // object url (ephemeral) or remote url
  name: string;
}

export interface ChatMessage {
  _id: string;
  userId: string;
  text: string;
  createdAt: number; // epoch ms
  attachments?: ChatAttachment[];
  status?: 'sending' | 'sent' | 'failed'; // optional, for optimistic UI updates
}

export interface TaskChatProps {
  isOpen: boolean;
  onClose: () => void; // currently just hides if parent wants
  availableEmployees: Employee[];
  chatId: string; // unique per task / item to avoid interference
  showClose?: boolean; // hide close button when false
}

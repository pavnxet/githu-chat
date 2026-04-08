"use client";

interface Props {
  typingUsers: string[];
}

export function TypingIndicator({ typingUsers }: Props) {
  if (typingUsers.length === 0) return null;

  let text = "";
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing...`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  } else {
    text = `${typingUsers.length} people are typing...`;
  }

  return (
    <div className="px-4 py-1 text-sm text-gray-500 dark:text-gray-400 italic">
      {text}
    </div>
  );
}

import { useState } from "react";

export function HeaderTitle({ chat, onRename }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(chat?.title || "");

  const [prevChatId, setPrevChatId] = useState(chat?.id);
  if (chat?.id !== prevChatId) {
    setPrevChatId(chat?.id);
    setTitle(chat?.title || "");
    setIsEditing(false);
  }

  const handleSave = () => {
    setIsEditing(false);
    const clean = title.trim();
    if (clean && clean !== chat?.title) {
      onRename(clean);
    } else {
      setTitle(chat?.title || "");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTitle(chat?.title || "");
      setIsEditing(false);
    }
  };

  if (!chat) {
    return (
      <div className="min-w-0 flex items-center">
        <span className="text-[0.9375rem] font-semibold text-foreground select-none py-1 px-1">
          New chat
        </span>
      </div>
    );
  }

  // Editing state: auto-sized pill input driven by mirror span
  if (isEditing) {
    return (
      <div className="min-w-0 flex items-center">
        <div className="relative inline-flex items-center min-w-[60px] max-w-[340px] sm:max-w-[420px]">
          <span
            aria-hidden="true"
            className="invisible whitespace-pre px-3.5 py-1 text-[0.9375rem] font-semibold select-none pointer-events-none"
          >
            {title || "\u00A0"}
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="absolute inset-0 w-full h-full rounded-full border bg-secondary/40 dark:bg-neutral-900/90 px-3.5 py-1 text-[0.9375rem] font-semibold text-foreground outline-none ring-0 shadow-xs"
          />
        </div>
      </div>
    );
  }

  // Default normal text state
  return (
    <div className="min-w-0 flex items-center">
      <span
        onClick={() => setIsEditing(true)}
        title="Click to rename"
        className="text-[0.9375rem] font-semibold text-foreground truncate cursor-pointer hover:opacity-80 transition-opacity select-none py-1 px-1 rounded-sm"
      >
        {chat.title}
      </span>
    </div>
  );
}

export default HeaderTitle;

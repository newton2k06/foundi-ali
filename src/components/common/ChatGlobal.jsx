import React, { useEffect, useState, useRef } from "react";
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, limit, updateDoc, deleteDoc, doc 
} from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import Linkify from "../common/Linkify"; 

// ----------------- MESSAGE BUBBLE -----------------
const MessageBubble = React.memo(({
  message,
  isEditing,
  editText,
  onStartEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onEditTextChange,
  onEditKeyDown,
}) => {
  const isOwn = message.userId === auth.currentUser?.uid;
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-md px-4 py-3 rounded-2xl shadow-sm break-words ${
          isOwn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        {/* header */}
        <div className="flex justify-between mb-1">
          <p className="text-sm font-bold">
            {isOwn ? "Moi" : message.userName}
          </p>

          {/* actions */}
          {isOwn && !isEditing && (
            <div className="flex gap-2 opacity-70">
              <button
                onClick={() => onStartEdit(message)}
                className="text-xs hover:opacity-100"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(message.id)}
                className="text-xs hover:opacity-100"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {/* content */}
        {isEditing ? (
          <>
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              onKeyDown={(e) => onEditKeyDown(e, message.id)}
              className="w-full p-2 rounded border text-black text-sm resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={onCancelEdit}
                className="text-xs bg-gray-400 px-2 py-1 rounded text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => onSaveEdit(message.id)}
                className="text-xs bg-green-500 px-2 py-1 rounded text-white"
              >
                Sauvegarder
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              <Linkify text={message.text} />
            </p>
            <p className="text-xs opacity-70 mt-1">
              {message.createdAt?.toDate?.().toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {message.isEdited && " · modifié"}
            </p>
          </>
        )}
      </div>
    </div>
  );
});

// ------------------ CHAT GLOBAL -------------------
export default function ChatGlobal() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const messagesEndRef = useRef(null);

  // load messages
  useEffect(() => {
    const q = query(
      collection(db, "messages_global"),
      orderBy("createdAt", "asc"),
      limit(200)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // send
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const u = auth.currentUser;
    if (!u) return;

    await addDoc(collection(db, "messages_global"), {
      text: newMessage.trim(),
      userId: u.uid,
      userName: u.displayName || u.email.split("@")[0],
      createdAt: serverTimestamp(),
      isEdited: false,
    });

    setNewMessage("");
  };

  // editing
  const startEdit = (m) => {
    setEditingMessage(m.id);
    setEditText(m.text);
  };

  const saveEdit = async (id) => {
    await updateDoc(doc(db, "messages_global", id), {
      text: editText.trim(),
      isEdited: true,
      updatedAt: serverTimestamp(),
    });
    setEditingMessage(null);
  };

  const deleteMsg = async (id) => {
    if (window.confirm("Supprimer ce message ?")) {
      await deleteDoc(doc(db, "messages_global", id));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm h-[500px] flex flex-col">
      
      


      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isEditing={editingMessage === m.id}
            editText={editText}
            onStartEdit={startEdit}
            onDelete={deleteMsg}
            onSaveEdit={saveEdit}
            onCancelEdit={() => setEditingMessage(null)}
            onEditTextChange={setEditText}
            onEditKeyDown={(e, id) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                saveEdit(id);
              }
            }}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* input */}
      <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Votre message..."
          className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
        />
        <button
          disabled={!newMessage.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}

import React, { useEffect, useState, useRef } from "react";
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, limit, updateDoc, deleteDoc, doc 
} from "firebase/firestore";
import { db, auth } from "../../firebase/config";

// Composant MessageBubble séparé avec React.memo
const MessageBubble = React.memo(({ 
  message, 
  isEditing, 
  editText, 
  onStartEdit, 
  onDelete, 
  onSaveEdit, 
  onCancelEdit, 
  onEditTextChange, 
  onEditKeyDown 
}) => {
  const isOwnMessage = message.userId === auth.currentUser?.uid;
  const textareaRef = useRef(null);

  // Focus automatique quand on entre en mode édition
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs px-4 py-2 rounded-lg relative group ${
        isOwnMessage 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        
        {/* En-tête du message */}
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm font-semibold">
            {isOwnMessage ? '👤 Moi' : message.userName}
          </p>
          
          {/* Menu d'actions (uniquement pour ses propres messages) */}
          {isOwnMessage && !isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <div className="flex gap-1">
                <button 
                  onClick={() => onStartEdit(message)}
                  className="text-xs bg-white text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
                  title="Modifier"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => onDelete(message.id)}
                  className="text-xs bg-white text-red-600 px-2 py-1 rounded hover:bg-red-50"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contenu du message (édition ou affichage) */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              onKeyDown={(e) => onEditKeyDown(e, message.id)}
              className="w-full p-2 border rounded text-gray-800 text-sm resize-none"
              rows={Math.min(Math.max(editText.split('\n').length, 2), 6)}
              maxLength={500}
              placeholder="Modifiez votre message..."
            />
            <div className="flex gap-2 justify-end items-center">
              <span className="text-xs text-gray-500 flex-1">
                {editText.length}/500
              </span>
              <button 
                onClick={onCancelEdit}
                className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              >
                Annuler
              </button>
              <button 
                onClick={() => onSaveEdit(message.id)}
                disabled={!editText.trim()}
                className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 whitespace-pre-wrap break-words">{message.text}</p>
            
            {/* Pied du message avec horodatage et indication de modification */}
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs opacity-70">
                {message.createdAt?.toDate?.().toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) || '...'}
              </p>
              {message.isEdited && (
                <p className="text-xs opacity-70 italic ml-2">modifié</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default function ChatGlobal() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const unsubscribeRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const q = query(
          collection(db, "messages_global"), 
          orderBy("createdAt", "asc"),
          limit(100)
        );
        
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }

        unsubscribeRef.current = onSnapshot(q, 
          (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setMessages(messagesData);
            setLoading(false);
          },
          (error) => {
            console.error("Erreur Firestore:", error);
            setLoading(false);
          }
        );

      } catch (error) {
        console.error("Erreur initialisation chat:", error);
        setLoading(false);
      }
    };

    loadMessages();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Scroll automatique vers le bas quand nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "messages_global"), {
        text: newMessage.trim(),
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email.split('@')[0],
        userRole: "user",
        type: "global",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isEdited: false
      });
      setNewMessage("");
    } catch (error) {
      console.error("Erreur envoi message:", error);
      alert("Erreur lors de l'envoi du message");
    }
  };

  // MODIFIER un message
  const startEditMessage = (message) => {
    if (message.userId === auth.currentUser?.uid) {
      setEditingMessage(message.id);
      setEditText(message.text);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };

  const saveEdit = async (messageId) => {
    if (!editText.trim()) return;

    try {
      const messageRef = doc(db, "messages_global", messageId);
      await updateDoc(messageRef, {
        text: editText.trim(),
        updatedAt: serverTimestamp(),
        isEdited: true
      });
      setEditingMessage(null);
      setEditText("");
    } catch (error) {
      console.error("Erreur modification message:", error);
      alert("Erreur lors de la modification du message");
    }
  };

  // SUPPRIMER un message
  const deleteMessage = async (messageId) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce message ?")) {
      try {
        await deleteDoc(doc(db, "messages_global", messageId));
      } catch (error) {
        console.error("Erreur suppression message:", error);
        alert("Erreur lors de la suppression du message");
      }
    }
  };

  // Gérer la touche Entrée dans le textarea d'édition
  const handleEditKeyDown = (e, messageId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit(messageId);
    }
    if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm h-[500px] flex items-center justify-center">
        <p className="text-gray-600">Chargement des messages...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-blue-50">
        <h2 className="text-xl font-semibold">📢 Chat Global</h2>
        <p className="text-sm text-gray-600">
          Discussions générales de la classe
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            ✏️ Survolez vos messages pour les modifier
          </span>
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Aucun message. Soyez le premier à écrire !</p>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message}
                isEditing={editingMessage === message.id}
                editText={editText}
                onStartEdit={startEditMessage}
                onDelete={deleteMessage}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                onEditTextChange={setEditText}
                onEditKeyDown={handleEditKeyDown}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Votre message pour toute la classe..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={500}
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
}
import { useEffect, useState } from "react";
import { 
  collection, addDoc, onSnapshot, query, where, orderBy, 
  serverTimestamp, getDocs, updateDoc, deleteDoc, doc 
} from "firebase/firestore";
import { db, auth } from "../../firebase/config";

export default function MessageriePrivee() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");

  // Charger le rôle utilisateur et les étudiants
  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      setUserId(user.uid);

      const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", user.uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        setUserRole(userData.role);

        if (userData.role === "superuser") {
          const studentsSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "eleve")));
          setStudents(studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          const teacherSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "superuser")));
          if (!teacherSnapshot.empty) {
            const teacher = teacherSnapshot.docs[0];
            setTeacherId(teacher.id);
            setSelectedStudent({ 
              id: teacher.id, 
              ...teacher.data() 
            });
          }
        }
      }
    };

    loadData();
  }, []);

  // Charger les messages privés
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !userRole) return;

    let q;

    if (userRole === "superuser") {
      if (!selectedStudent) return;
      
      q = query(
        collection(db, "messages_prives"),
        where("participants", "array-contains", user.uid),
        orderBy("createdAt", "asc")
      );
    } else {
      q = query(
        collection(db, "messages_prives"), 
        where("participants", "array-contains", user.uid),
        orderBy("createdAt", "asc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));

      if (userRole === "superuser" && selectedStudent) {
        const filteredMessages = allMessages.filter(message => 
          message.participants.includes(selectedStudent.id)
        );
        setMessages(filteredMessages);
      } else if (userRole === "eleve" && teacherId) {
        const filteredMessages = allMessages.filter(message => 
          message.participants.includes(teacherId)
        );
        setMessages(filteredMessages);
      }
    }, (error) => {
      console.error("Erreur écoute messages:", error);
    });

    return () => unsubscribe();
  }, [selectedStudent, userRole, userId, teacherId]);

  const sendPrivateMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const user = auth.currentUser;
    try {
      if (userRole === "superuser") {
        if (!selectedStudent) return;
        
        await addDoc(collection(db, "messages_prives"), {
          text: newMessage.trim(),
          fromUserId: user.uid,
          fromUserName: user.displayName || user.email.split('@')[0],
          fromUserRole: userRole,
          toUserId: selectedStudent.id,
          toUserName: selectedStudent.prenom + " " + selectedStudent.nom,
          participants: [user.uid, selectedStudent.id],
          type: "private",
          read: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isEdited: false
        });
      } else {
        if (!teacherId) return;
        
        await addDoc(collection(db, "messages_prives"), {
          text: newMessage.trim(),
          fromUserId: user.uid,
          fromUserName: user.displayName || user.email.split('@')[0] || "Élève",
          fromUserRole: userRole,
          toUserId: teacherId,
          toUserName: "Mr Ali",
          participants: [user.uid, teacherId],
          type: "private",
          read: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isEdited: false
        });
      }
      setNewMessage("");
    } catch (error) {
      console.error("Erreur envoi message privé:", error);
      alert("Erreur lors de l'envoi du message");
    }
  };

  // MODIFIER un message
  const startEditMessage = (message) => {
    if (message.fromUserId === userId) {
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
      const messageRef = doc(db, "messages_prives", messageId);
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
        await deleteDoc(doc(db, "messages_prives", messageId));
      } catch (error) {
        console.error("Erreur suppression message:", error);
        alert("Erreur lors de la suppression du message");
      }
    }
  };

  // Composant d'affichage d'un message
  const MessageBubble = ({ message }) => {
    const isOwnMessage = message.fromUserId === userId;
    const isEditing = editingMessage === message.id;

    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs px-4 py-2 rounded-lg relative group ${
          isOwnMessage 
            ? 'bg-blue-500 text-white' 
            : userRole === 'eleve' ? 'bg-yellow-50 border border-yellow-200 text-gray-800' : 'bg-gray-100 text-gray-800'
        }`}>
          
          {/* En-tête du message */}
          <div className="flex justify-between items-start mb-1">
            <p className="text-sm font-semibold">
              {isOwnMessage ? '👤 Moi' : (userRole === 'eleve' ? '👨‍🏫 Mr Ali' : message.fromUserName)}
            </p>
            
            {/* Menu d'actions (uniquement pour ses propres messages) */}
            {isOwnMessage && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <div className="flex gap-1">
                  <button 
                    onClick={() => startEditMessage(message)}
                    className="text-xs bg-white text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => deleteMessage(message.id)}
                    className="text-xs bg-white text-red-600 px-2 py-1 rounded hover:bg-red-50"
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
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 border rounded text-gray-800 text-sm"
                rows="3"
                maxLength={500}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={cancelEdit}
                  className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => saveEdit(message.id)}
                  className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-1 whitespace-pre-wrap">{message.text}</p>
              
              {/* Pied du message avec horodatage et indication de modification */}
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs opacity-70">
                  {message.createdAt?.toDate?.().toLocaleTimeString('fr-FR') || '...'}
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
  };

  // Vue ÉLÈVE
  if (userRole === "eleve") {
    return (
      <div className="bg-white rounded-xl shadow-sm h-[600px] flex flex-col">
        <div className="p-4 border-b bg-green-50">
          <h2 className="text-xl font-semibold">💬 Discussion avec Mr Ali</h2>
          <p className="text-sm text-gray-600">
            Messages privés avec votre professeur 
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              ✏️ Modifiez vos messages en les survolant
            </span>
          </p>
        </div>

        {/* Zone des messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucun message avec votre professeur.</p>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </div>

        {/* Zone de réponse pour l'élève */}
        <form onSubmit={sendPrivateMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Répondre à Mr Ali..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              maxLength={500}
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Vue PROFESSEUR
  return (
    <div className="bg-white rounded-xl shadow-sm h-[600px] flex">
      {/* Liste des étudiants */}
      <div className="w-1/3 border-r">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold">👥 Liste des élèves</h3>
          <p className="text-xs text-gray-600 mt-1">
            ✏️ Survolez vos messages pour les modifier
          </p>
        </div>
        <div className="overflow-y-auto h-[500px]">
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                selectedStudent?.id === student.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <p className="font-medium">{student.prenom} {student.nom}</p>
              <p className="text-sm text-gray-600">{student.email}</p>
              <p className="text-xs text-gray-500">Série: {student.serie}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Zone de discussion */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-blue-50">
          <h2 className="text-xl font-semibold">
            {selectedStudent ? `💬 Discussion avec ${selectedStudent.prenom}` : "Sélectionnez un élève"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedStudent ? (
            messages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucun message avec cet élève.</p>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )
          ) : (
            <p className="text-center text-gray-500 py-8">Sélectionnez un élève pour voir la conversation</p>
          )}
        </div>

        {selectedStudent && (
          <form onSubmit={sendPrivateMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message pour ${selectedStudent.prenom}...`}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={500}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
              >
                Envoyer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
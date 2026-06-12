// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔥 YOUR FIREBASE CONFIG (replace these)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections
const playersRef = collection(db, "players");
const matchesRef = collection(db, "matches");

// =======================
// ADD PLAYER
// =======================
window.addPlayer = async function () {
  const nameInput = document.getElementById("playerName");
  const name = nameInput.value.trim();

  if (!name) return alert("Enter a player name");

  try {
    await addDoc(playersRef, {
      name,
      wins: 0,
      losses: 0,
      points: 0,
      createdAt: Date.now()
    });

    nameInput.value = "";
  } catch (err) {
    console.error("Error adding player:", err);
  }
};

// =======================
// ADD MATCH
// =======================
window.addMatch = async function () {
  const p1 = document.getElementById("player1").value;
  const p2 = document.getElementById("player2").value;
  const score1 = parseInt(document.getElementById("score1").value);
  const score2 = parseInt(document.getElementById("score2").value);

  if (!p1 || !p2) return alert("Select players");
  if (isNaN(score1) || isNaN(score2)) return alert("Enter scores");

  try {
    await addDoc(matchesRef, {
      player1: p1,
      player2: p2,
      score1,
      score2,
      createdAt: Date.now()
    });

    // Update player stats (simple logic)
    const winner = score1 > score2 ? p1 : p2;
    const loser = score1 > score2 ? p2 : p1;

    // update wins/losses locally via snapshot logic (below handles UI)
  } catch (err) {
    console.error("Error adding match:", err);
  }
};

// =======================
// REALTIME PLAYERS LIST
// =======================
onSnapshot(query(playersRef, orderBy("points", "desc")), (snapshot) => {
  const list = document.getElementById("playersList");
  list.innerHTML = "";

  snapshot.forEach((doc) => {
    const p = doc.data();

    const div = document.createElement("div");
    div.className = "player";

    div.innerHTML = `
      <strong>${p.name}</strong>
      <p>Wins: ${p.wins} | Losses: ${p.losses} | Points: ${p.points}</p>
    `;

    list.appendChild(div);
  });
});

// =======================
// REALTIME MATCHES LIST
// =======================
onSnapshot(query(matchesRef), (snapshot) => {
  const list = document.getElementById("matchesList");
  list.innerHTML = "";

  snapshot.forEach((doc) => {
    const m = doc.data();

    const div = document.createElement("div");
    div.className = "match";

    div.innerText = `${m.player1} ${m.score1} - ${m.score2} ${m.player2}`;

    list.appendChild(div);
  });
});
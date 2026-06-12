import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔥 Firebase config (PUT YOUR REAL KEYS HERE)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const playersRef = collection(db, "players");
const matchesRef = collection(db, "matches");

// =======================
// ADD PLAYER
// =======================
window.addPlayer = async function () {
  const first = document.getElementById("firstName").value.trim();
  const last = document.getElementById("lastName").value.trim();

  if (!first || !last) {
    alert("Enter full name");
    return;
  }

  const name = `${first} ${last}`;

  await addDoc(playersRef, {
    name,
    wins: 0,
    losses: 0,
    points: 0,
    createdAt: Date.now()
  });

  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
};

// =======================
// CREATE MATCH
// =======================
window.addMatch = async function () {
  const p1 = document.getElementById("player1").value;
  const p2 = document.getElementById("player2").value;
  const s1 = parseInt(document.getElementById("score1").value);
  const s2 = parseInt(document.getElementById("score2").value);

  if (!p1 || !p2 || isNaN(s1) || isNaN(s2)) {
    alert("Fill all match fields");
    return;
  }

  await addDoc(matchesRef, {
    player1: p1,
    player2: p2,
    score1: s1,
    score2: s2,
    createdAt: Date.now()
  });

  // Update stats
  const winner = s1 > s2 ? p1 : p2;
  const loser = s1 > s2 ? p2 : p1;

  updatePlayerStats(winner, loser);
};

// =======================
// UPDATE STATS
// =======================
async function updatePlayerStats(winnerName, loserName) {
  onSnapshot(playersRef, async (snapshot) => {
    snapshot.forEach(async (docSnap) => {
      const player = docSnap.data();

      const ref = doc(db, "players", docSnap.id);

      if (player.name === winnerName) {
        await updateDoc(ref, {
          wins: player.wins + 1,
          points: player.points + 3
        });
      }

      if (player.name === loserName) {
        await updateDoc(ref, {
          losses: player.losses + 1
        });
      }
    });
  });
}

// =======================
// LOAD PLAYERS INTO DROPDOWN
// =======================
onSnapshot(playersRef, (snapshot) => {
  const p1 = document.getElementById("player1");
  const p2 = document.getElementById("player2");

  const table = document.getElementById("tableBody");

  p1.innerHTML = "";
  p2.innerHTML = "";
  table.innerHTML = "";

  let players = [];

  snapshot.forEach(docSnap => {
    players.push({ id: docSnap.id, ...docSnap.data() });
  });

  // sort leaderboard
  players.sort((a, b) => b.points - a.points);

  players.forEach((p, index) => {
    // dropdowns
    const opt1 = document.createElement("option");
    opt1.value = p.name;
    opt1.textContent = p.name;

    const opt2 = opt1.cloneNode(true);

    p1.appendChild(opt1);
    p2.appendChild(opt2);

    // leaderboard
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${p.name}</td>
        <td>${p.wins}</td>
        <td>${p.losses}</td>
        <td>${p.points}</td>
      </tr>
    `;

    table.innerHTML += row;
  });
});

// =======================
// LOAD MATCHES
// =======================
onSnapshot(query(matchesRef, orderBy("createdAt", "desc")), (snapshot) => {
  const div = document.getElementById("matches");
  div.innerHTML = "";

  snapshot.forEach(docSnap => {
    const m = docSnap.data();

    div.innerHTML += `
      <p>${m.player1} ${m.score1} - ${m.score2} ${m.player2}</p>
    `;
  });
});
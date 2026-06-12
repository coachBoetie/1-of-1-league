console.log("🔥 script loaded");
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 🔥 YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAvmq-HKsv64UOBQUmIVXeIOdm_bdwhzwk",
  authDomain: "f-1-league.firebaseapp.com",
  projectId: "f-1-league",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const playersRef = collection(db, "players");
const matchesRef = collection(db, "matches");


// =======================
// ADD PLAYER (now uses ELO)
// =======================
window.addPlayer = async function () {
  const first = document.getElementById("firstName").value.trim();
  const last = document.getElementById("lastName").value.trim();

  if (!first || !last) return alert("Enter full name");

  await addDoc(playersRef, {
    name: `${first} ${last}`,
    points: 0,
    wins: 0,
    losses: 0,
    createdAt: Date.now()
  });

  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
};

// =======================
// ADD MATCH (PRO VERSION)
// =======================
window.addMatch = async function () {
  const p1Name = document.getElementById("player1").value;
  const p2Name = document.getElementById("player2").value;
  const s1 = parseInt(document.getElementById("score1").value);
  const s2 = parseInt(document.getElementById("score2").value);

if (!p1Name || !p2Name || isNaN(s1) || isNaN(s2))
    return alert("Fill everything");

  if (p1Name === p2Name)
  return alert("A player cannot play against themselves");

  const p1Win = s1 > s2;
  const margin = Math.abs(s1 - s2);

  let p1Points = 0;
  let p2Points = 0;

  if (p1Win) {
    p1Points = 3 + (margin >= 5 ? 1 : 0);
    p2Points = 0;
  } else {
    p2Points = 3 + (margin >= 5 ? 1 :0);
    p1Points = 0;
  }

  const playersSnap = await getDocs(playersRef);

  let p1, p2;

  playersSnap.forEach(d => {
    if (d.data().name === p1Name) p1 = { id: d.id, ...d.data() };
    if (d.data().name === p2Name) p2 = { id: d.id, ...d.data() };
  });

  //UPDATE PLAYER 1
  await updateDoc(doc(db, "players", p1.id), {
    points: (p1.points || 0) + p1Points,
    wins: p1.wins + (p1Win ? 1 : 0),
    losses: p1.losses + (p1Win ? 0 : 1)
});

//UPDATE PLAYER 2
await updateDoc(doc(db, "players", p2.id), {
    points: (p2.points || 0) + p2Points,
    wins: p2.wins + (p1Win ? 0 : 1),
    losses: p2.losses + (p1Win ? 1 : 0)
});


  await addDoc(matchesRef, {
    player1: p1Name,
    player2: p2Name,
    score1: s1,
    score2: s2,
    winner: p1Win ? p1Name : p2Name,
    createdAt: Date.now()
  });
};

// =======================
// UI: PLAYERS + TABLE
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

  players.sort((a, b) => (b.points || 0) - (a.points || 0));

  players.forEach((p, i) => {
    const opt = `<option value="${p.name}">${p.name}</option>`;
    p1.innerHTML += opt;
    p2.innerHTML += opt;

    table.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.wins}</td>
        <td>${p.losses}</td>
        <td>${p.points || 0}</td>
      </tr>
    `;
  });
});

// =======================
// MATCH HISTORY
// =======================
onSnapshot(query(matchesRef, orderBy("createdAt", "desc")), (snapshot) => {
  const div = document.getElementById("matches");
  div.innerHTML = "";

  snapshot.forEach(d => {
    const m = d.data();
    div.innerHTML += `
      <p><b>${m.winner}</b> won → ${m.player1} ${m.score1} - ${m.score2} ${m.player2}</p>
    `;
  });
});
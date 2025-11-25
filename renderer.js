const API_KEY = "SUA_API_AKI";

async function handleSearch() {
  const termo = document.getElementById("query").value.trim();
  const container = document.getElementById("resultados");

  if (!termo) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Digite algo para pesquisar</h3>
        <p>Encontre vídeos de música, tutoriais, reviews e muito mais.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "<p style='text-align:center;color:#aaa;'>🔎 Buscando vídeos...</p>";

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=12&q=${encodeURIComponent(termo)}&key=${API_KEY}`
    );
    const data = await res.json();
    renderResults(data.items || []);
  } catch (err) {
    container.innerHTML = `
      <p style="text-align:center;color:#f66;">
        ❌ Erro ao buscar vídeos. Verifique sua conexão ou API Key.
      </p>
    `;
  }
}

function renderResults(videos) {
  const container = document.getElementById("resultados");
  if (!videos.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nenhum vídeo encontrado</h3>
        <p>Tente usar outras palavras-chave.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = videos.map(item => `
    <div class="video-card" onclick="abrirVideo('${item.id.videoId}')">
      <img src="${item.snippet.thumbnails.medium.url}" alt="${item.snippet.title}">
      <h3>${item.snippet.title}</h3>
      <p>${item.snippet.channelTitle}</p>
    </div>
  `).join("");
}

function abrirVideo(id) {
  window.api.abrirVideoClean(id);
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("query");
  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSearch();
    });
  }
});

window.abrirVideo = abrirVideo;
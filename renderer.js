function handleSearch() {
  const termo = document.getElementById("query").value.trim();
  if (!termo) return;
  window.api.buscar(termo, renderResults);
}

function renderResults(videos) {
  const container = document.getElementById("resultados");
  if (!videos.length) {
    container.innerHTML = "<p>Nenhum vídeo encontrado.</p>";
    return;
  }

  container.innerHTML = videos.map(item => `
    <div class="video-card" onclick="abrirVideo('${item.id.videoId}')">
      <img src="${item.snippet.thumbnails.medium.url}">
      <h3>${item.snippet.title}</h3>
      <p>${item.snippet.channelTitle}</p>
    </div>
  `).join("");
}

function abrirVideo(id) {
  window.api.abrirVideoClean(id);
}

// ✅ ATIVAR BUSCA COM ENTER
document.getElementById("query").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});

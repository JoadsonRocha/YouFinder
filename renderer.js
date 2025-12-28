const API_KEY = "AIzaSyBCw7R1v8vYsu5wiz4UT3RJp-X2mRif24s";

let currentQuery = "";
let nextPageToken = "";
let isLoading = false;
let observer = null;
const searchCache = {}; // Cache object

async function handleSearch() {
  const termo = document.getElementById("query").value.trim();
  const container = document.getElementById("resultados");

  if (!termo) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>🎬 Que tal assistir algo hoje?</h3>
        <p>Pesquise por músicas, tutoriais, jogos e muito mais.</p>
      </div>
    `;
    return;
  }

  // Reset state
  currentQuery = termo;
  nextPageToken = "";
  isLoading = false;
  container.innerHTML = ""; // Clear previous results

  // Remove old sentinel if exists (though clearing container does this, mostly)
  if (observer) observer.disconnect();

  await fetchVideos();
}

async function fetchVideos() {
  if (isLoading) return;
  isLoading = true;

  const container = document.getElementById("resultados");

  // Show loader at bottom if not first page
  let loader = null;
  if (nextPageToken || container.children.length === 0) {
    loader = document.createElement("div");
    loader.className = "loader-container";
    loader.innerHTML = '<div class="spinner"></div>';
    container.appendChild(loader);
  }

  const cacheKey = `${currentQuery}_${nextPageToken}`;

  try {
    let data;

    // Check Cache
    if (searchCache[cacheKey]) {
      console.log("Using cached data for:", cacheKey);
      data = searchCache[cacheKey];
    } else {
      let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=12&q=${encodeURIComponent(currentQuery)}&key=${API_KEY}`;
      if (nextPageToken) {
        url += `&pageToken=${nextPageToken}`;
      }

      const res = await fetch(url);
      data = await res.json();

      // Save to Cache
      if (!data.error) {
        searchCache[cacheKey] = data;
      }
    }

    // Remove loader
    if (loader) loader.remove();

    if (data.error) {
      console.error(data.error);
      throw new Error(data.error.message);
    }

    nextPageToken = data.nextPageToken || "";
    renderResults(data.items || []);

    // Setup observer for next page
    if (nextPageToken) {
      setupObserver();
    }

  } catch (err) {
    if (loader) loader.remove();
    console.error(err);

    let msg = err.message;
    if (msg.includes("Failed to fetch")) {
      msg = "Sem conexão com a Internet 🌐";
    }

    if (!nextPageToken) { // Only show error if it's the first load
      container.innerHTML = `
        <div class="empty-state">
            <h3>😕 Ops, algo deu errado!</h3>
            <p>${msg}</p>
            <button onclick="handleSearch()" style="margin-top:15px; padding:8px 16px; cursor:pointer;">Tentar Novamente</button>
        </div>
      `;
    }
  } finally {
    isLoading = false;
  }
}

function renderResults(videos) {
  const container = document.getElementById("resultados");

  if (!videos.length && !container.hasChildNodes()) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nenhum vídeo encontrado</h3>
        <p>Tente usar outras palavras-chave.</p>
      </div>
    `;
    return;
  }

  // Append items
  const fragment = document.createDocumentFragment();
  videos.forEach(item => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.onclick = () => abrirVideo(item);
    card.innerHTML = `
      <img src="${item.snippet.thumbnails.medium.url}" alt="${item.snippet.title}">
      <h3>${item.snippet.title}</h3>
      <p>${item.snippet.channelTitle}</p>
    `;
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

function setupObserver() {
  if (observer) observer.disconnect();

  const options = {
    root: null, // viewport
    rootMargin: '100px', // trigger before reaching bottom
    threshold: 0.1
  };

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && nextPageToken && !isLoading) {
      fetchVideos();
    }
  }, options);

  // Observe the last element or a specific sentinel
  const container = document.getElementById("resultados");
  const lastCard = container.lastElementChild;
  if (lastCard) {
    observer.observe(lastCard);
  }
}

function abrirVideo(item) {
  // Save to history
  if (item && item.id && item.id.videoId) {
    window.config.addToHistory(item);
    window.api.abrirVideoClean(item.id.videoId);
  } else if (typeof item === 'string') {
    // Fallback
    window.api.abrirVideoClean(item);
  }
}

function openHistoryWindow() {
  window.api.openHistory();
}

document.addEventListener("DOMContentLoaded", () => {
  let searchTimeout;
  const input = document.getElementById("query");
  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        clearTimeout(searchTimeout);
        handleSearch();
      }
    });

    input.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        handleSearch();
      }, 500);
    });
  }

  const btnHistory = document.getElementById("btnHistory");
  if (btnHistory) {
    btnHistory.addEventListener("click", openHistoryWindow);
  }
});

window.abrirVideo = abrirVideo;
window.handleSearch = handleSearch; // Important to expose to HTML

document.addEventListener("DOMContentLoaded", () => {
    // Check Theme
    const settings = window.config.get();
    if (!settings.modoClaro) {
        document.body.classList.replace("theme-light", "theme-dark");
    }

    const history = window.config.getHistory();
    const container = document.getElementById("historyContainer");

    if (!history.length) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #888; margin-top: 50px;">
                <h3>Nenhum vídeo no histórico</h3>
                <p>Seus vídeos assistidos aparecerão aqui.</p>
            </div>
        `;
        return;
    }

    history.forEach(item => {
        const card = document.createElement("div");
        card.className = "video-card";
        card.onclick = () => {
            window.api.abrirVideoClean(item.id.videoId);
        };
        card.innerHTML = `
            <img src="${item.snippet.thumbnails.medium.url}" alt="${item.snippet.title}">
            <h3>${item.snippet.title}</h3>
            <p>${item.snippet.channelTitle}</p>
        `;
        container.appendChild(card);
    });
});


const { contextBridge, ipcRenderer } = require("electron");

const API_KEY = "SUA_API_AQUI";

contextBridge.exposeInMainWorld("api", {
  buscar: async (termo, callback) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          termo
        )}&type=video&maxResults=12&key=${API_KEY}`
      );
      const data = await res.json();
      callback(data.items || []);
    } catch {
      callback([]);
    }
  },
  // abertura “sem distrações”
  abrirVideoClean: (id) => ipcRenderer.invoke("abrir-video-clean", id),
});


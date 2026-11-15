"use strict";

const point = document.getElementById("slider");
const pointOutput = document.getElementById("point");
const selection = document.getElementById("search-container");
const pointContainer = document.getElementById("point-container");
const result = document.getElementById("result-container");
const layout = document.getElementById("main-container");
const keyInput = document.getElementById("tmdb-key");
const status = document.getElementById("status");
const newQuery = document.getElementById("newQuery-btn");
const genres = Array.from(document.querySelectorAll("button.category"));
const baseUrl = "https://api.themoviedb.org/3";
const excludedDramaGenres = new Set([28, 12, 878]);

function updatePoint() {
    const value = Number(point.value);
    pointOutput.textContent = value;
    point.classList.toggle("super-charge", value >= 8);
    point.style.setProperty("--thumb-glow", `${value * (value >= 8 ? 6 : 3)}px`);
    point.style.setProperty("--thumb-color", value >= 8 ? "white" : "rgb(238, 203, 0)");
}

async function requestTmdb(path, key, parameters = {}) {
    const url = new URL(baseUrl + path);
    url.search = new URLSearchParams({ ...parameters, api_key: key });
    const response = await fetch(url);
    if (response.status === 401 || response.status === 403) {
        throw new Error("TMDB anahtarı kabul edilmedi.");
    }
    if (!response.ok) throw new Error("TMDB verileri alınamadı.");
    return response.json();
}

async function chooseFilm(genre, minimum, key) {
    const parameters = {
        language: "tr-TR",
        sort_by: "vote_average.desc",
        "vote_count.gte": "200",
        "vote_average.gte": String(minimum),
        with_genres: String(genre),
    };

    let page = 1;
    const visited = new Set();
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const data = await requestTmdb("/discover/movie", key, { ...parameters, page });
        visited.add(page);
        const matches = (data.results ?? []).filter((film) => (
            film.overview && film.poster_path && film.vote_average >= minimum &&
            film.genre_ids?.[0] === genre &&
            (genre !== 18 || !film.genre_ids.some((id) => excludedDramaGenres.has(id)))
        ));
        if (matches.length) return matches[Math.floor(Math.random() * matches.length)];

        const pages = Array.from({ length: Math.min(data.total_pages || 0, 41) }, (_, i) => i + 1)
            .filter((candidate) => !visited.has(candidate));
        if (!pages.length) break;
        page = pages[Math.floor(Math.random() * pages.length)];
    }

    throw new Error("Bu ölçütlere uygun film bulunamadı. Puanı düşürüp tekrar deneyin.");
}

async function recommend(button) {
    const key = keyInput.value.trim();
    if (!key) {
        status.textContent = "Önce TMDB API anahtarınızı girin.";
        keyInput.focus();
        return;
    }

    genres.forEach((item) => { item.disabled = true; });
    status.textContent = "Film aranıyor…";
    try {
        const film = await chooseFilm(Number(button.dataset.id), Number(point.value), key);
        const credits = await requestTmdb(`/movie/${film.id}/credits`, key).catch(() => null);
        const director = credits?.crew?.find((person) => person.job === "Director");
        const poster = document.querySelector("#left-section img");
        const words = film.overview.trim().split(/\s+/);
        poster.src = `https://image.tmdb.org/t/p/w500${film.poster_path}`;
        poster.alt = `${film.title} afişi`;
        document.getElementById("movie-name").textContent = film.title;
        document.getElementById("summary").textContent =
            words.length > 60 ? `${words.slice(0, 60).join(" ")}…` : film.overview;
        document.getElementById("category").textContent = button.querySelector("h4").textContent;
        document.getElementById("director").textContent = director?.name ?? "Yönetmen bilinmiyor";
        document.querySelector("#second-section p:nth-child(2)").textContent =
            film.release_date?.slice(0, 4) ?? "";

        pointContainer.style.display = "none";
        selection.style.display = "none";
        result.style.display = "flex";
        layout.classList.add("showing-film");
        status.textContent = "";
        newQuery.focus();
    } catch (error) {
        status.textContent = error instanceof TypeError
            ? "TMDB’ye bağlanılamadı. İnternet bağlantınızı kontrol edin."
            : error.message;
    } finally {
        genres.forEach((item) => { item.disabled = false; });
    }
}

point.addEventListener("input", updatePoint);
genres.forEach((button) => button.addEventListener("click", () => recommend(button)));
newQuery.addEventListener("click", () => {
    result.style.display = "none";
    layout.classList.remove("showing-film");
    selection.style.display = "";
    pointContainer.style.display = "";
    point.focus();
});
updatePoint();

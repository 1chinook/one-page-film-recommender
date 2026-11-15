# One-Page Film Recommender

Sinema Botu, seçilen tür ve asgari puana göre TMDB’den film önerir.

## Kurulum ve çalıştırma

`sinemabotu.html` dosyasını açın. [TMDB hesabınızın API ayarlarından](https://www.themoviedb.org/settings/api) bir v3 API anahtarı edinin.

## Kullanım

API anahtarını ekrandaki alana girin, asgari puanı ayarlayın ve bir tür seçin. Sonuçta filmin afişi, yılı, özeti ve mevcutsa yönetmeni gösterilir. Anahtar yalnızca açık sayfada kullanılır ve TMDB’ye gönderilir.

## Proje yapısı

- `sinemabotu.html` — arayüz ve stiller.
- `app.js` — filtreleme, TMDB istekleri ve sonuç ekranı.

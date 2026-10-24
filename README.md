# Muhammet Kırıklı — kişisel portföy

Gerçek projeleri, hareketli bir kişisel sahne ve etkileşimli sistem akışlarıyla anlatan statik portföy. HTML, CSS ve JavaScript ile çalışır; derleme veya paket kurulumu gerekmez.

## Yerelde aç

Bu klasörde bir terminal aç:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Ardından [localhost:8000](http://localhost:8000) adresine git. Windows’ta Python `py` adıyla kuruluysa aynı komutu `py -m http.server 8000 --bind 127.0.0.1` olarak çalıştırabilirsin. Yerel sunucu, etkinlik JSON dosyasının da okunmasını sağlar.

## İçeriği değiştir

- `content.js`: kişisel bilgiler, on proje, teknoloji listeleri, proje akışları ve iletişim. Yeni proje eklerken aynı alan yapısını kullan; `id` değerini benzersiz tut. Yayınlanmış bir kaynak bağlantısı yoksa `repo: null` bırak.
- `data/activity.json`: AI ile üretim günleri. Biçim:

```json
{
  "source": "AI ile üretim günleri",
  "days": [
    { "date": "2026-10-23", "count": 3 }
  ]
}
```

`date`, `YYYY-MM-DD`; `count`, sıfır veya pozitif bir tam sayıdır. Aynı günün kayıtları toplanır. Takvim İstanbul tarihine göre geriye dönük 364 günü gösterir. Başlangıç dosyası boştur; otomatik bir AI kaynağı bağlı değildir. Yalnız paylaşmak istediğin gerçek kayıtları ekle. Yoğunluk etkinlik sayısıdır; süre veya iş kalitesi ölçümü değildir.

## Dosyalar

- `index.html`, `style.css`, `direction.css` ve `profile.css`: sayfa yapısı ve görsel dil.
- `app.js`: gezinme, proje ayrıntıları, hareket kontrolü ve takvim.
- `kinetic.js`: imleç çekimi, yerel bükülme ve kalıcı biçim vermeyi destekleyen Canvas şerit; dönüş sürer, sıfırlama düğmesi biçimi geri alır.
- `narrator.js` ve `narrator.css`: takvimin üzerinde zıplayan Luci yorumu ve yavaş yazılan terminal düşünceleri. Balona tıkla veya Enter ile ilerlet.
- `cursor.js` ve `cursor.css`: beş parmaklı dikişli eldiven, yakınlaşınca açılan eklem ve butonlardan uzanan siyah lifler. Dokunma, metin girişi, hareket duraklatma ve azaltılmış harekette normal imleç korunur.
- `system-lab.js`: projelerin adımlarını gösteren etkileşimli akış alanı.
- `ARASTIRMA.md`: sekiz tasarım kaynağı, gözlem sınırları ve özgün uygulama kararları.

Hareket kontrolleri ve azaltılmış hareket tercihi, deneyimin parçasıdır. Bu portföy için yeni görsel üretimi kullanılmadı; sahne ve akışlar kodla çizilir.

## GitHub Pages

Kaynak depo: [muhammetaycn/muhammet-kirikli-portfolio](https://github.com/muhammetaycn/muhammet-kirikli-portfolio). Canlı yayın: [muhammetaycn.github.io/muhammet-kirikli-portfolio](https://muhammetaycn.github.io/muhammet-kirikli-portfolio/).

Statik dosyaları depo kökünde tut. GitHub Pages, kök dizindeki `index.html` dosyasını doğrudan sunabilir; `.nojekyll` bu yapı için ek Jekyll işlemini kapatır. Varsa statik yayımlama Actions akışı da aynı klasörü kullanabilir. Bağlantılar göreli olduğundan depo alt yolunda çalışır. GitHub Pages, `main` dalının kök dizininden yayımlanır. Değişiklikleri bu dala göndermek siteyi günceller. İlk yayın 23 Ekim 2026’da tarayıcıda doğrulandı.

## Bağlantılar ve lisans

[GitHub: muhammetaycn](https://github.com/muhammetaycn) · [LinkedIn: Muhammet Kırıklı](https://www.linkedin.com/in/muhammet-kirikli/)

Kod [MIT lisansıyla](LICENSE) paylaşılır. Yerel fontların lisansları `assets/fonts/` içindedir. Luci karakteri, Disenchantment’a ait karakterin kodla çizilmiş bir hayran yorumudur; karakter üzerindeki haklar MIT kod lisansının kapsamında değildir ve resmi bir bağlantı iddiası yoktur. Proje metinlerindeki geliştirme/prototip durumları güncellendikçe `content.js` üzerinden değiştirilebilir.


## Kimlik ve kaynak

İçerik, Muhammet Kırıklı’nın [LinkedIn profili](https://www.linkedin.com/in/muhammet-kirikli/), profildeki yedi proje açıklaması, 65 yetenek ve önceden incelenmiş yerel proje kaynaklarına dayanır. Eğitim ve saha deneyimi, yazılım, sistem tasarımı, mobil uygulamalar, AI otomasyonu ve görsel tasarımla birlikte anlatılır. Discord kullanıcı adı gösterilmez.

## Luci’nin piksel sahnesi

52 × 7 hücrenin tamamı hareket alanıdır. Siyah, Discord mavisi, turkuaz, kehribar ve gül renkli Luci yorumları sırayla bütün kelimeler yazar. Yazım 3,4–7,8 saniye, okunur bekleme 2,4–3,5 saniye sürer; eski kelime 1,6 saniyede arkadan silinirken yeni karakter girer. Aynı anda en fazla iki karakter görünür. Proje içeriklerinden türetilen 896 kısa düşünce tekrar sırasını değiştirir. Sayfa görünmüyorken süre ilerlemez. Genel hareket kontrolü sahneyi durdurur; azaltılmış harekette okunur sabit yazı gösterilir. Renkli animasyon katmanı gerçek üretim verilerini değiştirmez.

## mk.desktop / 32 tuş

Açılıştaki iki sahne otomatik veya elle seçilebilir. Şerit 12, bilgisayar 18 saniye görünür. Pointer, odak, basılı tutma ve büyütülmüş ekran keşfi kesmez; otomatik tur etkileşimden 14 saniye sonra devam eder. Üstteki genel hareket düğmesi tüm sahneleri durdurur.

Bilgisayarın 8 × 4 gri tuşu yazısızdır. Hover veya klavye odağında işlev adı görünür; oklarla gezin, Enter/Space ile çalıştır. Terminal, düzenlenebilir arayüz, yerel API, gerçek SQLite sorguları/ilişkileri/transaction, proje akışları, kod farkı, sürümler, testler, kuyruk/cache/yetkiler, motion/renk/piksel araçları ve iki küçük oyun bulunur. **Ekranı büyüt** aynı uygulamanın durumunu korur. Deneyler bu tarayıcıda çalışır; gerçek servis veya hesaplarda işlem yapmaz.

- `hero-deck.js/css`: sahne geçişi, etkileşim ve görünürlük kilitleri.
- `computer-scene.js/css`: CSS hacimleri, blank tuşlar, Luci ve fiziksel geri bildirim.
- `computer-os.js/css`: 32 deney, büyütülebilir ekran, ortak yerel durum ve temizleme.
- `computer-db.js`: gerektiğinde yüklenen gerçek SQLite bellek veritabanı.

`assets/vendor/sqljs/` altındaki sql.js 1.15.1 MIT lisanslıdır; kaynak ve bütünlük kaydı aynı klasördedir. SQLite dosyaları yalnızca veritabanı uygulaması açılınca yüklenir. Sayfa yenilendiğinde deney verileri sıfırlanır.

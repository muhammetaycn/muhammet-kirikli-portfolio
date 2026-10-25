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
- `data/activity.json`: bu portföyün kaynak commitlerinden üretilen geliştirme günlüğü. İstanbul tarihine göre son 364 gün gösterilir. Kayıtlı günü seçince commit başlığı, SHA ve GitHub bağlantısı açılır. Luci renkleri bu verinin üstünde ayrı bir animasyon katmanıdır.

Günlüğü yenilemek için kaynak değişikliklerini önce commit et, sonra Node.js ve Git bulunan bir terminalde çalıştır:

```sh
node scripts/update-activity.cjs
git add data/activity.json
git commit -m "Refresh portfolio build log"
```

Script yalnız bu depodaki gerçek kaynak commitlerini sayar; salt günlük dosyası güncellemeleri sayımın dışında kalır. JSON, `metric: repository_commits`, kaynak depo, üretim tarihi ve her günün commit bağlantılarını taşır. Bu dosyada AI hesabı kullanım analitiği bulunmaz.

## Dosyalar

- `index.html`, `style.css`, `direction.css` ve `profile.css`: sayfa yapısı ve görsel dil.
- `app.js`: gezinme, proje ayrıntıları, hareket kontrolü ve takvim.
- `kinetic.js`: imleç çekimi, yerel bükülme ve kalıcı biçim vermeyi destekleyen Canvas şerit; dönüş sürer, sıfırlama düğmesi biçimi geri alır.
- `narrator.js` ve `narrator.css`: birlikte yazan Luciler, EN/TR terminal düşünceleri ve yanlış inişten toparlanma. Balona tıkla veya Enter ile sonraki düşünceyi sıraya al.
- `cursor.js` ve `cursor.css`: beş parmaklı dikişli eldiven, açılan eklem ve elden hedefe uzanan, gerilip geri çekilen siyah simbiyot dokusu.
- `system-lab.js/css`: yedi yerel akış; düzenlenebilir veri, doğrulama, onay/durdurma, tekrar kayıt koruması ve JSON/işlem izi.
- `capability-map.js/css`: sekiz yetenek alanını ilgili gerçek proje ayrıntılarına bağlayan harita.
- `personal-dock.js/css`: sabit bölüm bağlantıları ve gerçek profil içeriğini kullanan küçük kişisel panel.
- `project-motion.js/css`: proje önizlemesiyle ayrıntı dialogu arasında görsel devamlılık, kesilebilir proje değişimi ve geri dönüş.
- `ui-icons.js/css`: mobilde emojiye dönüşmeyen SVG yön ve durum işaretleri.
- `motion-film.js/css`: kendi kısa arka plan filmi, sabit poster ve kelime bütünlüğünü koruyan başlık girişleri.
- `MOTION-ARASTIRMA.md`: Dribbble, Webflow ve Noctra incelemeleri; açılan canlı örnekler, uygulama kararları ve sınırlar.
- `ARASTIRMA.md`: tasarım kaynakları, ayrı video/site gözlemleri, gözlem sınırları ve özgün uygulama kararları.

Hareket kontrolleri ve azaltılmış hareket tercihi, deneyimin parçasıdır. Sahne, arka plan filmi ve akışlar kendi kodumuzla çizilir; üretken görsel API'si kullanılmadı.

## Arka plan ve ziyaretçi akışı

7,2 saniyelik yerel WebM, kendi parametrik şerit geometrimizden üretilmiştir; 54 KB dosya ve SVG poster kullanır. Görünmezlik, dialog, duraklatma ve azaltılmış hareket durumları oynatımı durdurur. Beş portföy başlığı kelime maskeleriyle bir kez açılır. Kodla üretim için `scripts/render-motion-film.py` kullanılabilir.

Sistemler bölümünde her örnek somut bir işle başlar. Girdi ve ana eylem yan yanadır; Enter da çalışır. Sonuç kartı yazılan başlığı ve gerçek yerel kaydı gösterir. JSON ve işlem izi, kapalı gelen **Teknik ayrıntılar** içinde bulunur. Yeni kaynakların gözlemleri [motion araştırmasında](MOTION-ARASTIRMA.md) kayıtlıdır.

## Kişisel Dock ve proje ayrıntıları

Alttaki kompakt Dock; Başlangıç, Çalışmalar, Sistemler ve Kod günlüğüne normal bölüm bağlantılarıyla gider. Küçük `mk` düğmesi, Muhammet Kırıklı'nın adını, Türkiye/İstanbul saatini, `content.js` içindeki gerçek proje ve yetenek sayılarını gösteren kişisel paneli açar. GitHub ve LinkedIn bağlantıları aynı kimlik kaynağından gelir. Geliştirme kartı, yalnız bu portföyün kaynak deposuyla eşleşen commit günlüğünü kabul eder; ilk halinde doğrudan kaynak depoya bağlanır.

Proje ayrıntısında seçilen çalışmanın kodla çizilmiş önizlemesi büyük sahneye taşınır. Açılış, başka projeye geçiş ve kapanış birbirini kesebilir; eski animasyon yeni seçimi değiştiremez. Escape, kapatma kontrolü ve klavye odağı yerel dialog davranışıyla çalışır. Genel duraklatma ve azaltılmış hareket seçimi, bu geçişlerin sabit karşılığını kullanır. Dar ekranlarda Dock'un dış sosyal kısayolları gizlenir; sosyal bağlantılar kişisel panelde bulunur.

Bu uyarlama, videodaki küçük kişisel alan ile ayrıca incelenen proje galerisi örneğinden gelir. Kullanıcının ekran görüntüsündeki sitenin kesin URL'si henüz çözülmedi; o siteyle eşleştirme tamamlanmış sayılmaz. Kaynakların ayrımı [ARASTIRMA.md](ARASTIRMA.md) ve [istek durumu](ISTEK-DURUMU.md) içinde kayıtlıdır.

## Simbiyot imleci

Ağ, parmak eklemi, başparmak ve manşetteki üç ayrı noktadan çıkar. Her bağlantıda üç incelen gövde, altı dal ve aralarındaki zarlar bulunur; aynı anda en fazla iki bağlantı tutulur. Yakınlık dokuyu kalınlaştırır, siyah damarlar eldivene yayılır; basma hareketi ağ boyunca bir dalga gönderir.

El önceki sürüme göre yaklaşık %30 küçüktür; parmak eklemi açılırken ve basma sırasında hafifçe esnerken gerçek tıklama noktası sabit kalır. Ağ kökleri aynı hassas dönüşümle hesaplanır. Yeni hedef 150 px içinde edinilir; tutunmuş bağlantı 216 px'e kadar gerilir, bırakıldığında 580 ms boyunca geri çekilir. Bütün dallar aynı kopma anındaki konumdan çekilir; yeniden tutunma 180 ms içinde birleşir.

İlk temas yönü dışarıdaki baskın eksene göre seçilir ve bağlantı boyunca sabit kalır. Üzeri başka bir bölümle örtülen düğmelere tutunulmaz. Küçük kontrollerde ana liflerin uçları da düğme kenarına sığar. Temas kenarındaki siyah doku çekimle kabarır, basmada içeriye ince bir dalga yayılır; düğmelerin konumu ve tıklama alanı değiştirilmez.

İmleç etkin dialogun içine taşınır. Metin alanlarında, dokunmada, azaltılmış harekette ve genel duraklatmada normal imleç kullanılır. Sayfa gizlenince çizim durur; serbest imleç sakinleşince yeni animasyon karesi istenmez. İlgisiz metin ve piksel güncellemeleri bu döngüyü uyandırmaz.

## GitHub Pages

Kaynak depo: [muhammetaycn/muhammet-kirikli-portfolio](https://github.com/muhammetaycn/muhammet-kirikli-portfolio). Canlı yayın: [muhammetaycn.github.io/muhammet-kirikli-portfolio](https://muhammetaycn.github.io/muhammet-kirikli-portfolio/).

Statik dosyaları depo kökünde tut. GitHub Pages, kök dizindeki `index.html` dosyasını doğrudan sunabilir; `.nojekyll` bu yapı için ek Jekyll işlemini kapatır. Varsa statik yayımlama Actions akışı da aynı klasörü kullanabilir. Bağlantılar göreli olduğundan depo alt yolunda çalışır. GitHub Pages, `main` dalının kök dizininden yayımlanır. Değişiklikleri bu dala göndermek siteyi günceller. İlk yayın 23 Ekim 2026’da tarayıcıda doğrulandı.

## Bağlantılar ve lisans

[GitHub: muhammetaycn](https://github.com/muhammetaycn) · [LinkedIn: Muhammet Kırıklı](https://www.linkedin.com/in/muhammet-kirikli/)

Kod [MIT lisansıyla](LICENSE) paylaşılır. Yerel fontların lisansları `assets/fonts/` içindedir. Luci karakteri, Disenchantment’a ait karakterin kodla çizilmiş bir hayran yorumudur; karakter üzerindeki haklar MIT kod lisansının kapsamında değildir ve resmi bir bağlantı iddiası yoktur. Proje metinlerindeki geliştirme/prototip durumları güncellendikçe `content.js` üzerinden değiştirilebilir.


## Kimlik ve kaynak

İçerik, Muhammet Kırıklı’nın [LinkedIn profili](https://www.linkedin.com/in/muhammet-kirikli/), profildeki yedi proje açıklaması, 65 yetenek ve önceden incelenmiş yerel proje kaynaklarına dayanır. Eğitim ve saha deneyimi, yazılım, sistem tasarımı, mobil uygulamalar, AI otomasyonu ve görsel tasarımla birlikte anlatılır. Discord kullanıcı adı gösterilmez.

## Luci’nin piksel sahnesi

52 × 7 matris tek cümle için ortak bir sahnedir. İki kalıcı Luci sırayla yazar ve siler. Tam cümle 2,8 saniye okunur; mevcut yazar başlangıçtan silmeye başladığında diğeri boşalan hücrelere yeni cümleyi yazar. İki uç aynı saatle, üç sütunluk aralıkla ilerler. Hücre sahipliği eski ve yeni yazının çarpışmasını önler. Siyah Luci kimliğini korur; ikinci karakter syntax tonlarıyla değişir. Sahne bankası boyunca 364 hücrenin tamamı kullanılır.

96 teknik konu, dönüşümlü EN/TR 192 özgün kısa cümle ve 384 düşünce içerir. Düşünceler en az 5 saniye okunur. Yanlış iniş sırasında iki uç birlikte durur; kırmızı iz, WARN/RECOVER ve küçük panel kırılmasının ardından aynı yerden devam eder. Gerçek etkinlik verileri değişmez. Balona basmak sonraki cümleyi güvenli kuyruğa alır. Görünmeyen veya duraklatılmış sayfada süre ilerlemez; azaltılmış harekette sabit okunur durum gösterilir.

Telefon dahil düşünce gövdesi 12 px'tir. Balonlarda gereksiz boşluk azaltıldı; uzun teknik terimler dışarı taşmadan satıra bölünür. Yeni cümle için karakterler başlangıca döner, roller yer değiştirir.

## mk.desktop / 32 tuş

Açılıştaki iki sahne otomatik veya elle seçilebilir. Şerit 4,2, bilgisayar 5,8 saniye görünür. Fare alanın üzerindeyken tur ve ilerleme göstergesi donar; çıkınca kalan süre 320 ms sonra devam eder. Klavye odağı, yazı alanları, basılı tutma ve büyütülmüş ekran da sahneyi korur. Üstteki genel hareket düğmesi tüm sahneleri durdurur.

Bilgisayarın 8 × 4 gri tuşu yazısızdır. Hover veya klavye odağında işlev adı görünür; oklarla gezin, Enter/Space ile çalıştır. Terminal, düzenlenebilir arayüz, yerel API, gerçek SQLite sorguları/ilişkileri/transaction, proje akışları, kod farkı, sürümler, testler, kuyruk/cache/yetkiler, motion/renk/piksel araçları ve iki küçük oyun bulunur. **Ekranı büyüt** aynı uygulamanın durumunu korur. Deneyler bu tarayıcıda çalışır; gerçek servis veya hesaplarda işlem yapmaz.

- `hero-deck.js/css`: sahne geçişi, etkileşim ve görünürlük kilitleri.
- `computer-scene.js/css`: CSS hacimleri, yazısız tuşlar, Luci ve fiziksel geri bildirim.
- `computer-os.js/css`: 32 deney, büyütülebilir ekran, ortak yerel durum ve temizleme.
- `computer-db.js`: gerektiğinde yüklenen gerçek SQLite bellek veritabanı.

`assets/vendor/sqljs/` altındaki sql.js 1.15.1 MIT lisanslıdır; kaynak ve bütünlük kaydı aynı klasördedir. SQLite dosyaları yalnızca veritabanı uygulaması açılınca yüklenir. Sayfa yenilendiğinde deney verileri sıfırlanır.

Proje detayları ve sistem akışlarındaki uygulama düğmeleri, ilgili deneyi aynı bilgisayar ekranında açar. Büyütülen ekran kapatılınca klavye odağı onu açan kontrole döner.

İlk bilgisayar görünümünde 1,2 saniyelik uyanış, ardından tek seferlik bir uygulama turu vardır. İç imleç gerçek uygulama düğmesinin merkezine gider; Terminal'de `projects`, SQLite'ta gerçek JOIN ve Sürümler'de ilişki şeması gösterilir. Fare, klavye veya yazıyla kontrolü almak turu anında durdurur. Geç kalan otomatik sorgu sonucu kullanıcının ekranını veya yazısını değiştiremez. Sahne görünmezken düşünce ve fizik süreleri ilerlemez.

Bu sürümün istek karşılaştırması [ISTEK-DURUMU.md](ISTEK-DURUMU.md) içindedir.

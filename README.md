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
- `portfolio-stage.js/css`: büyük proje sahnesi, dört özgün HTML/SVG ürün arayüzü ve görünürlüğe bağlı hareket.
- `readability.css`: gövde metni, kontrast, düşünce balonları ve normal yazıyla cümle karşılığı.
- `app.js`: gezinme, proje ayrıntıları, hareket kontrolü ve takvim.
- `kinetic.js`: imleç çekimi, yerel bükülme ve kalıcı biçim vermeyi destekleyen Canvas şerit; dönüş sürer, sıfırlama düğmesi biçimi geri alır.
- `narrator.js` ve `narrator.css`: birlikte yazan Luciler, EN/TR terminal düşünceleri ve yanlış inişten toparlanma. Balona tıkla veya Enter ile sonraki cümleyi güvenli sınırda sıraya al.
- `cursor.js` ve `cursor.css`: beş parmaklı dikişli eldiven, açılan eklem ve elden hedefe uzanan, gerilip geri çekilen siyah simbiyot dokusu.
- `system-lab.js/css`: yedi yerel akış; düzenlenebilir veri, doğrulama, onay/durdurma, tekrar kayıt koruması ve JSON/işlem izi.
- `capability-map.js/css`: sekiz yetenek alanını ilgili gerçek proje ayrıntılarına bağlayan harita.
- `personal-dock.js/css`: sabit bölüm bağlantıları ve gerçek profil içeriğini kullanan küçük kişisel panel.
- `project-motion.js/css`: proje önizlemesiyle ayrıntı dialogu arasında görsel devamlılık, kesilebilir proje değişimi ve geri dönüş.
- `project-gallery.js/css`: dört proje arasında dokunma ve klavyeyle seçim, konum göstergesi, eski sahneyi koruyan maskeli geçiş ve kesilebilir görsel–açıklama hareketi.
- `menu-motion.js/css`: beş gerçek bölüm bağlantısı, maskeli açılış, kısa kapanış, güncel bölüm ve güvenli odak dönüşü.
- `ui-icons.js/css`: mobilde emojiye dönüşmeyen SVG yön ve durum işaretleri.
- `motion-film.js/css`: yalnız açılışta çalışan kendi kısa arka plan filmi, sabit poster ve çalışmalar başlığının kelime bütünlüğünü koruyan girişi.
- `MOTION-VIDEO-2026-10-27.md`: son ZIP içindeki dört MP4 için zamanlı gözlemler, yeni proje sahnesi ve okunabilirlik kararları.
- `MOTION-ARASTIRMA.md`: Dribbble, Webflow ve Noctra incelemeleri; açılan canlı örnekler, uygulama kararları ve sınırlar.
- `ARASTIRMA-2026-10-27.md`: bilgisayar/Luci zamanlaması ve LinuxOfficial'ın masaüstü, mobil, not ve konsol incelemesi.
- `ARASTIRMA.md`: tasarım kaynakları, ayrı video/site gözlemleri, gözlem sınırları ve özgün uygulama kararları.

Hareket kontrolleri ve azaltılmış hareket tercihi, deneyimin parçasıdır. Sahne, arka plan filmi ve akışlar kendi kodumuzla çizilir; üretken görsel API'si kullanılmadı.

## Arka plan ve ziyaretçi akışı

7,2 saniyelik yerel WebM, kendi parametrik şerit geometrimizden üretilmiştir; 54 KB dosya ve SVG poster kullanır. Film yalnız açılış görünürken çalışır; dialog, duraklatma ve azaltılmış hareket durumları da oynatımı durdurur. Çalışmalar başlığı kelime maskesiyle bir kez açılır; diğer başlıklarda aynı maske tekrarlanmaz. Kodla üretim için `scripts/render-motion-film.py` kullanılabilir.

Çalışmalar bölümü sıcak fildişi bir yüzey üzerinde büyük, koyu bir proje sahnesi kullanır. IDOLOG, TekstilOS, Acıktınmı ve portföy için ayrı HTML/SVG arayüzleri çizildi. Seçimde eski görsel çıkarken yenisi 620 ms içinde açılır; açıklama 450 ms geçiş yapar. Okuma alanlarında arka plan hareketi azaltıldı. Ana metinler masaüstünde yaklaşık 15–19 px, telefonda 14–16 px aralığındadır. Son dört videonun kaynak ayrımı ve uygulama kararları [video araştırmasında](MOTION-VIDEO-2026-10-27.md) kayıtlıdır.

Sistemler bölümünde her örnek somut bir işle başlar. Girdi ve ana eylem yan yanadır; Enter da çalışır. Sonuç kartı yazılan başlığı ve gerçek yerel kaydı gösterir. JSON ve işlem izi, kapalı gelen **Teknik ayrıntılar** içinde bulunur. Yeni kaynakların gözlemleri [motion araştırmasında](MOTION-ARASTIRMA.md) kayıtlıdır.

## Kişisel Dock ve proje ayrıntıları

Alttaki kompakt Dock; Başlangıç, Çalışmalar, Sistemler ve Kod günlüğüne normal bölüm bağlantılarıyla gider. Küçük `mk` düğmesi, Muhammet Kırıklı'nın adını, Türkiye/İstanbul saatini, `content.js` içindeki gerçek proje ve yetenek sayılarını gösteren kişisel paneli açar. GitHub ve LinkedIn bağlantıları aynı kimlik kaynağından gelir. Geliştirme kartı, yalnız bu portföyün kaynak deposuyla eşleşen commit günlüğünü kabul eder; ilk halinde doğrudan kaynak depoya bağlanır.

Proje ayrıntısında seçilen çalışmanın kodla çizilmiş önizlemesi büyük sahneye taşınır. Açılış, başka projeye geçiş ve kapanış birbirini kesebilir; eski animasyon yeni seçimi değiştiremez. Escape, kapatma kontrolü ve klavye odağı yerel dialog davranışıyla çalışır. Genel duraklatma ve azaltılmış hareket seçimi, bu geçişlerin sabit karşılığını kullanır. Dar ekranlarda Dock'un dış sosyal kısayolları gizlenir; sosyal bağlantılar kişisel panelde bulunur.

Önizlemedeki önceki/sonraki düğmeleri projeleri sırayla açar; Sol/Sağ/Home/End bu kontrollerde aynı seçimi yapar. Sayaç, kısa ad ve dört parçalı konum birlikte değişir. Otomatik proje geçişi yoktur. Tam ekran menü, Canlı günlük dahil beş normal bölüm bağlantısını gösterir; bölüm seçimi odağı menüye veya profil düğmesine geri taşımaz. Proje sahnesi sayfa akışı içinde kalır; dar ekranda görsel ve açıklama alt alta geçer. Düşünce balonları metni küçültmek yerine dikey alan kazanır.

Bu uyarlama, videodaki küçük kişisel alan ile ayrıca incelenen proje galerisi örneğinden gelir. Kullanıcının ekran görüntüsündeki sitenin kesin URL'si henüz çözülmedi; o siteyle eşleştirme tamamlanmış sayılmaz. Kaynakların ayrımı [ARASTIRMA.md](ARASTIRMA.md) ve [istek durumu](ISTEK-DURUMU.md) içinde kayıtlıdır.

## Simbiyot imleci

Ağ, parmak eklemi, başparmak ve manşetteki üç ayrı noktadan çıkar. Her bağlantıda üç incelen gövde, altı dal ve aralarındaki zarlar bulunur; aynı anda en fazla iki bağlantı tutulur. Yakınlık dokuyu kalınlaştırır, siyah damarlar eldivene yayılır; basma hareketi ağ boyunca bir dalga gönderir.

El önceki sürüme göre yaklaşık %30 küçüktür. İşaret parmağı üç sabit uzunluklu parçayla çizilir: avuçtaki kök sabit kalır, yaklaşmada iki eklem açılır, tıklamada aynı eklemler avuca doğru kapanır. Parmak ucu gerçek tıklama noktasını korur; dikişler, kıvrım çizgileri ve ağın kökü aynı geometriyi izler. Yeni hedef 150 px içinde edinilir; tutunmuş bağlantı 216 px'e kadar gerilir, bırakıldığında 580 ms boyunca geri çekilir. Bütün dallar aynı kopma anındaki konumdan çekilir; yeniden tutunma 180 ms içinde birleşir.

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

28 Ekim son revizyonu: masaüstünde bilgisayar yeniden ana ölçekte; sahne en az 800 px yüksekliğinde ve Dock solda. Yeni `project-conduit.js/css`, fildişi kabloyu dört gerçek proje seçimine bağlar. Port seçimi galeriyi değiştirir, çalışmalar bölümüne gider ve odağı başlığa taşır. Kaydırma tek karede topluca işlenir; duraklatma, gizli sayfa, modal ve azaltılmış hareket ortak sınırları kullanır. Luci bankasında artık istek/tekrar deneme, cache doğrulama ve SQL transaction için üç anlatı dizisi vardır: 17 bağlı adım, 79 diğer konuyla karışır; toplam 192 kısa ifade ve 384 düşünce korunur.

52 × 7 matris tek cümle için ortak bir sahnedir. İki kalıcı Luci sırayla yazar ve siler. Tam cümle 3,6 saniye okunur; mevcut yazar başlangıçtan silmeye başladıktan sonra diğeri boşalan hücrelere yeni cümleyi yazar. İki uç yoğunluğa göre aynı saatle ilerler: her gerçek basış en az 90 ms, boş sütun 36 ms; güvenli aralık en az üç sütundur. Hücre sahipliği eski ve yeni yazının çarpışmasını önler. Siyah Luci kimliğini korur; ikinci karakter syntax tonlarıyla değişir. Sahne bankası boyunca 364 hücrenin tamamı kullanılır.

96 teknik konu, dönüşümlü EN/TR 192 özgün kısa ifade ve 384 düşünce içerir. Konu sırası karışır; aynı konunun çevirisi en az 47 sahne sonra gelir. Sabit açılış kaldırıldı. Yenilemede hemen aynı konuya dönmemek için yalnız son konu numarası `sessionStorage` içinde tutulur; analitik kaydı değildir. Düşünceler en az 5 saniye okunur. Yanlış iniş sırasında iki uç birlikte durur; kırmızı iz, WARN/RECOVER ve küçük panel kırılmasının ardından aynı yerden devam eder. Gerçek etkinlik verileri değişmez. Balona basmak sonraki cümleyi güvenli kuyruğa alır. Görünmeyen veya duraklatılmış sayfada süre ilerlemez; azaltılmış harekette sabit okunur durum gösterilir.

Düşünce gövdesi masaüstünde 14 px, mobilde 13 px'tir; uzun teknik terimler dışarı taşmadan satıra bölünür. Matrisin altında normal yazıyla cümle karşılığı bulunur: masaüstünde 18 px, mobilde 16 px. Son tamamlanan cümle, sıradaki tamamlanana kadar görünür kalır; Türkçe karakterler korunur. Yeni cümle için karakterler başlangıca döner, roller yer değiştirir.

## mk.desktop / 32 tuş

Açılıştaki iki sahne otomatik veya elle seçilebilir. Şerit 4,2 saniye görünür; bilgisayarın 5,8 saniyelik taban süresi, başlangıç ve işlem bitene, ardından sonuç gerçekten okunana kadar uzar. Her otomatik ziyarette tek bölüm tamamlanır: kısa kimlik komutu, SQLite JOIN veya sürüm/şema. Hazır sonuçtan sonra 3,4–3,6 saniye okuma payı vardır. Fare alanın üzerindeyken tur ve ilerleme göstergesi donar; çıkınca kalan süre 320 ms sonra devam eder. Yalnız monitörün üstünden geçmek gösterimi iptal etmez; gerçek kullanıcı girdisi kontrolü alır. Klavye odağı, yazı alanları, basılı tutma ve büyütülmüş ekran da sahneyi korur. Üstteki genel hareket düğmesi tüm sahneleri durdurur.

Terminal girdisi 32 elle yazılmış komuta kadar oturum geçmişi tutar. Yukarı/Aşağı geçmişi gezerken yarım taslak korunur; boş olmayan tek eşleşmeli komut başı Tab ile tamamlanır. Boş veya argümanlı girişte Tab normal odak gezinmesine devam eder. Otomatik gösterinin komutları bu geçmişe eklenmez.

Bilgisayarın 8 × 4 gri tuşu yazısızdır. Hover veya klavye odağında işlev adı görünür; oklarla gezin, Enter/Space ile çalıştır. Terminal, düzenlenebilir arayüz, yerel API, gerçek SQLite sorguları/ilişkileri/transaction, proje akışları, kod farkı, sürümler, testler, kuyruk/cache/yetkiler, motion/renk/piksel araçları ve iki küçük oyun bulunur. **Ekranı büyüt** aynı uygulamanın durumunu korur. Deneyler bu tarayıcıda çalışır; gerçek servis veya hesaplarda işlem yapmaz.

28 Ekim düzenlemesinde Luci ve düşünce paneli klavyenin altındaki ayrı alana taşındı. Monitörün `mk` logosu, hoparlörü ve turuncu güç ışığı bu panelle aynı alanı kullanmaz. Kısa uygulama adı düşünce panelinin başlığında görünür; tuşun tam açıklaması erişilebilir adında korunur. 430 × 700 tasarım yüzeyi, sahnenin dönüştürülmemiş yerleşim ölçülerine göre sığdırılır; düşünce yazısının ters ölçeği okunabilirliğini korur. Kaynak gözlemleri ve bu yerleşim kararları [28 Ekim araştırmasında](REFERENCE-DIRECTION-2026-10-28.md) ayrıdır.

- `hero-deck.js/css`: sahne geçişi, etkileşim ve görünürlük kilitleri.
- `computer-scene.js/css`: CSS hacimleri, yazısız tuşlar, Luci ve fiziksel geri bildirim.
- `computer-os.js/css`: 32 deney, büyütülebilir ekran, ortak yerel durum ve temizleme.
- `computer-db.js`: gerektiğinde yüklenen gerçek SQLite bellek veritabanı.

`assets/vendor/sqljs/` altındaki sql.js 1.15.1 MIT lisanslıdır; kaynak ve bütünlük kaydı aynı klasördedir. SQLite dosyaları yalnızca veritabanı uygulaması açılınca yüklenir. Sayfa yenilendiğinde deney verileri sıfırlanır.

Proje detayları ve sistem akışlarındaki uygulama düğmeleri, ilgili deneyi aynı bilgisayar ekranında açar. Büyütülen ekran kapatılınca klavye odağı onu açan kontrole döner.

Bilgisayar görünümünde 1,2 saniyelik uyanıştan sonra ziyaret başına tek uygulama bölümü tamamlanır. İç imleç gerçek uygulama düğmesinin merkezine gider; Terminal kimlik komutu, SQLite gerçek JOIN veya Sürümler ilişki şeması sırayla gösterilir. Gerçek kullanıcı girdisi turu durdurur; yalnız fareyle alanın üzerine gelmek mevcut turu dondurur. Geç kalan otomatik sorgu sonucu kullanıcının ekranını veya yazısını değiştiremez. Sahne görünmezken düşünce ve fizik süreleri ilerlemez.

Bu sürümün istek karşılaştırması [ISTEK-DURUMU.md](ISTEK-DURUMU.md) içindedir.


## Hareket sürekliliği

28 Ekim ikinci turunda açılışın isim/sahne oranı ortak grid ile yeniden kuruldu; tanıtım ve çalışma bağlantısı ilk ekrana alındı. Çalışmaların başlık ve üst boşluğu azaltıldı, ürün görseline daha fazla yer verildi. Mobil ürün başlığında marka ile durum metni için ayrı boşluk bulunur. Galeri geçişini mevcut motor yönetir; yeni bir animasyon kütüphanesi eklenmedi.

Luci'ler hücre aralığına göre 24–42 px boyutlanır. Mobil panelde matrise daha çok genişlik ayrılır. Düşüncenin tam satır alanı yazma başlamadan önce ayrıldığı için baloncuk yazı geldikçe büyüyüp yer değiştirmez. Ortak silme/yazma saati ve 192 ifade bankası korunur. [Tasarım yönü](DESIGN.md), [24 başlıklı istek incelemesi](REQUEST-REVIEW-2026-10-28.md) ve [yeniden incelenen video/site kaynakları](REFERENCE-STUDY-2026-10-28.md) bu turun kararlarını ve açık kalan işleri ayrı kaydeder.

Hızlı proje seçimleri yarım maskede boşluk bırakmaz; çıkış görseli o anki konumunu ve SVG rota ilerlemesini korur. Proje görseli hassas fareyle en çok 10/7 px tepki verir, kontroller sabit kalır. CSS animasyonları duraklatmada başa dönmez. Açılışın zaman hesabı geciken karelerde uzamaz; pencereye dönüş sabit hover kilidini yeniler. Kaydırma, görünüm ve içerik yüksekliği değişiklikleri tek karede birleştirilir. Dar ekranda bilgisayarın tam sınırları korunur. Yeni canlı kaynak gözlemleri ve test kapsamı [hareket araştırmasında](MOTION-AUDIT-2026-10-27.md) kayıtlıdır.
